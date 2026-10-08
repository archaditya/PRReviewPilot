const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../db/redis');
const config = require('../config');
const logger = require('../utils/logger');

const ACCESS_TOKEN_EXPIRY = '7d'; // 7 days persistent session
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days persistent refresh

class SessionService {
  constructor() {
    this.redis = getRedisClient();
  }

  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateAccessToken(user, sessionId, organizationId = null) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: organizationId,
        sessionId,
        tokenType: 'access',
      },
      config.jwt.secret,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  generateRefreshToken(user, sessionId) {
    return jwt.sign(
      {
        userId: user.id,
        sessionId,
        tokenType: 'refresh',
      },
      config.jwt.secret,
      { expiresIn: `${REFRESH_TOKEN_TTL_SECONDS}s` }
    );
  }

  async createSession(user, { userAgent = 'unknown', ip = 'unknown', organizationId = null } = {}) {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId,
      userAgent,
      ip,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isValid: true,
    };

    const sessionKey = `session:${user.id}:${sessionId}`;
    const userSessionsKey = `user:sessions:${user.id}`;

    // Store in Redis
    try {
      await this.redis.set(sessionKey, JSON.stringify(sessionData), 'EX', REFRESH_TOKEN_TTL_SECONDS);
      await this.redis.sadd(userSessionsKey, sessionId);
    } catch (err) {
      logger.warn({ err: err.message }, 'Redis write failed; falling back to stateless token');
    }

    const accessToken = this.generateAccessToken(user, sessionId, organizationId);
    const refreshToken = this.generateRefreshToken(user, sessionId);

    return {
      sessionId,
      accessToken,
      refreshToken,
      sessionData,
    };
  }

  async validateSession(userId, sessionId) {
    const sessionKey = `session:${userId}:${sessionId}`;
    try {
      const data = await this.redis.get(sessionKey);
      if (!data) return null;
      const session = JSON.parse(data);
      if (!session.isValid) return null;

      // Update last active asynchronously
      session.lastActiveAt = new Date().toISOString();
      this.redis.set(sessionKey, JSON.stringify(session), 'EX', REFRESH_TOKEN_TTL_SECONDS).catch(() => {});

      return session;
    } catch (err) {
      logger.warn({ err: err.message }, 'Redis session validation error');
      // If Redis is temporarily unreachable, return optimistic fallback
      return { userId, sessionId, isValid: true };
    }
  }

  async rotateSession(refreshTokenStr, { userAgent, ip } = {}) {
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, config.jwt.secret);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type for refresh');
    }

    const { userId, sessionId: oldSessionId } = decoded;

    // Validate old session exists in Redis
    const oldSession = await this.validateSession(userId, oldSessionId);
    if (!oldSession) {
      throw new Error('Session has been revoked or expired. Please log in again.');
    }

    // Revoke old session key
    await this.revokeSession(userId, oldSessionId);

    // Create new session
    const db = require('../models');
    const user = await db.User.findByPk(userId);
    if (!user || user.status !== 'active') {
      throw new Error('User account is deactivated or deleted');
    }

    return this.createSession(user, {
      userAgent: userAgent || oldSession.userAgent,
      ip: ip || oldSession.ip,
      organizationId: oldSession.organizationId,
    });
  }

  async revokeSession(userId, sessionId) {
    const sessionKey = `session:${userId}:${sessionId}`;
    const userSessionsKey = `user:sessions:${userId}`;
    try {
      await this.redis.del(sessionKey);
      await this.redis.srem(userSessionsKey, sessionId);
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to revoke session in Redis');
    }
  }

  async revokeAllUserSessions(userId) {
    const userSessionsKey = `user:sessions:${userId}`;
    try {
      const sessionIds = await this.redis.smembers(userSessionsKey);
      if (sessionIds && sessionIds.length > 0) {
        const pipeline = this.redis.pipeline();
        for (const sid of sessionIds) {
          pipeline.del(`session:${userId}:${sid}`);
        }
        pipeline.del(userSessionsKey);
        await pipeline.exec();
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to revoke all user sessions in Redis');
    }
  }

  async getUserSessions(userId) {
    const userSessionsKey = `user:sessions:${userId}`;
    try {
      const sessionIds = await this.redis.smembers(userSessionsKey);
      if (!sessionIds || sessionIds.length === 0) return [];

      const sessions = [];
      for (const sid of sessionIds) {
        const data = await this.redis.get(`session:${userId}:${sid}`);
        if (data) {
          sessions.push({ sessionId: sid, ...JSON.parse(data) });
        }
      }
      return sessions;
    } catch (err) {
      return [];
    }
  }
}

module.exports = new SessionService();
