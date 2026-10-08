const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../models');
const sessionService = require('../services/session.service');

async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.reviewpilot_access_token) {
      token = req.cookies.reviewpilot_access_token;
    } else if (req.cookies && req.cookies.reviewpilot_token) {
      token = req.cookies.reviewpilot_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. No session token provided.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const { userId, sessionId } = decoded;

    // Validate with Redis session store if sessionId exists
    if (sessionId) {
      const activeSession = await sessionService.validateSession(userId, sessionId);
      if (!activeSession) {
        return res.status(401).json({ success: false, error: 'Session has been invalidated or expired. Please re-authenticate.' });
      }
    }

    const user = await db.User.findByPk(userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, error: 'User not found or account has been suspended.' });
    }

    req.user = user;
    req.sessionId = sessionId;
    req.organizationId = decoded.organizationId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' && req.cookies && req.cookies.reviewpilot_refresh_token) {
      try {
        const rotated = await sessionService.rotateSession(req.cookies.reviewpilot_refresh_token, {
          userAgent: req.headers['user-agent'] || 'unknown',
          ip: req.ip || req.connection?.remoteAddress,
        });

        const isProd = config.env === 'production';
        res.cookie('reviewpilot_access_token', rotated.accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie('reviewpilot_refresh_token', rotated.refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        const decoded = jwt.verify(rotated.accessToken, config.jwt.secret);
        const user = await db.User.findByPk(decoded.userId);
        if (user && user.status === 'active') {
          req.user = user;
          req.sessionId = decoded.sessionId;
          req.organizationId = decoded.organizationId;
          return next();
        }
      } catch (rotateErr) {
        // Continue to expired token response
      }
      return res.status(401).json({ success: false, error: 'Access token expired. Please refresh session.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, error: 'Invalid authentication session.' });
  }
}

/**
 * Multi-Tenant Isolation Middleware:
 * Asserts that the authenticated user has active membership in the organization.
 */
function requireOrgAccess(paramKey = 'orgId') {
  return async (req, res, next) => {
    try {
      const orgId = req.params[paramKey] || req.query[paramKey] || req.body[paramKey] || req.organizationId;
      if (!orgId) {
        return res.status(400).json({ success: false, error: 'Organization ID is required for tenant context' });
      }

      // Check membership
      const membership = await db.OrganizationMember.findOne({
        where: {
          organizationId: orgId,
          userId: req.user.id,
          status: 'active',
        },
      });

      if (!membership && req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, error: 'Access forbidden: You do not belong to this organization.' });
      }

      req.membership = membership;
      req.currentOrgId = orgId;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  authenticate,
  requireOrgAccess,
};
