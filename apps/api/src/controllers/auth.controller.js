const authService = require('../services/auth.service');
const sessionService = require('../services/session.service');
const config = require('../config');
const db = require('../models');

class AuthController {
  setSessionCookies(res, accessToken, refreshToken) {
    const isProd = config.env === 'production';
    
    // Access token (15 mins)
    res.cookie('reviewpilot_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    // Refresh token (7 days)
    res.cookie('reviewpilot_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Legacy compatibility cookie
    res.cookie('reviewpilot_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
      }

      const result = await authService.registerWithEmail({
        email,
        password,
        name,
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.ip || req.connection?.remoteAddress,
      });

      this.setSessionCookies(res, result.accessToken, result.refreshToken);

      return res.status(201).json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        organization: {
          id: result.org.id,
          name: result.org.name,
          slug: result.org.slug,
        },
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const result = await authService.loginWithEmail({
        email,
        password,
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.ip || req.connection?.remoteAddress,
      });

      this.setSessionCookies(res, result.accessToken, result.refreshToken);

      return res.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        organization: {
          id: result.org.id,
          name: result.org.name,
          slug: result.org.slug,
        },
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/refresh
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.reviewpilot_refresh_token || req.body?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'No refresh token provided' });
      }

      const result = await sessionService.rotateSession(refreshToken, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      this.setSessionCookies(res, result.accessToken, result.refreshToken);

      return res.json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (err) {
      res.clearCookie('reviewpilot_access_token');
      res.clearCookie('reviewpilot_refresh_token');
      res.clearCookie('reviewpilot_token');
      return res.status(401).json({ success: false, error: err.message });
    }
  }

  // GET /api/auth/login/github
  githubLogin(req, res) {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=repo,user:email`;
    res.redirect(redirectUrl);
  }

  // GET /api/auth/callback/github
  async githubCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ success: false, error: 'Missing OAuth code' });
      }

      const result = await authService.handleGitHubCallback(code, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      this.setSessionCookies(res, result.accessToken, result.refreshToken);

      return res.redirect(`${config.appUrl}/dashboard?token=${result.accessToken}`);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/login/bitbucket
  bitbucketLogin(req, res) {
    const redirectUrl = `https://bitbucket.org/site/oauth2/authorize?client_id=${config.bitbucket.clientId}&response_type=code`;
    res.redirect(redirectUrl);
  }

  // GET /api/auth/callback/bitbucket
  async bitbucketCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ success: false, error: 'Missing OAuth code' });
      }

      const result = await authService.handleBitbucketCallback(code, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      this.setSessionCookies(res, result.accessToken, result.refreshToken);

      return res.redirect(`${config.appUrl}/dashboard?token=${result.accessToken}`);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/me
  async getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      const memberships = await db.OrganizationMember.findAll({
        where: { userId: user.id },
        include: [
          {
            model: db.Organization,
            as: 'organization',
            include: [{ model: db.Installation, as: 'installations' }],
          },
        ],
      });

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          hasGitHub: !!user.githubAccessToken,
          githubUsername: user.githubUsername,
          hasBitbucket: !!user.bitbucketAccessToken,
          bitbucketUsername: user.bitbucketUsername,
          organizations: memberships.map((m) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            role: m.role,
            installations: m.organization.installations || [],
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/sessions
  async listSessions(req, res, next) {
    try {
      const sessions = await sessionService.getUserSessions(req.user.id);
      return res.json({ success: true, sessions });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/auth/sessions/:sessionId
  async revokeSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      await sessionService.revokeSession(req.user.id, sessionId);
      return res.json({ success: true, message: 'Session revoked' });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/logout
  async logout(req, res) {
    if (req.user && req.sessionId) {
      await sessionService.revokeSession(req.user.id, req.sessionId);
    }
    res.clearCookie('reviewpilot_access_token');
    res.clearCookie('reviewpilot_refresh_token');
    res.clearCookie('reviewpilot_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();
