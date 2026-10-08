const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config');
const { getProvider } = require('../integrations/providers');
const sessionService = require('./session.service');
const emailService = require('./email.service');
const logger = require('../utils/logger');

class AuthService {
  async ensureDefaultOrganization(user) {
    const membership = await db.OrganizationMember.findOne({
      where: { userId: user.id },
      include: [{ model: db.Organization, as: 'organization' }],
    });

    if (membership) {
      return membership.organization;
    }

    const slugBase = (user.name || user.email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const slug = `${slugBase}-${user.id.substring(0, 6)}`;

    const org = await db.Organization.create({
      name: `${user.name || 'Personal'}'s Workspace`,
      slug,
      ownerUserId: user.id,
      billingEmail: user.email,
    });

    await db.OrganizationMember.create({
      organizationId: org.id,
      userId: user.id,
      role: 'owner',
      status: 'active',
    });

    return org;
  }

  async registerWithEmail({ email, password, name, userAgent, ip }) {
    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const count = await db.User.count();
    const isAdmin = count === 0 || (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
    const role = isAdmin ? 'superadmin' : 'user';

    const user = await db.User.create({
      email,
      name,
      passwordHash,
      emailVerified: false,
      role,
      status: 'active',
    });

    const org = await this.ensureDefaultOrganization(user);
    const session = await sessionService.createSession(user, {
      userAgent,
      ip,
      organizationId: org.id,
    });

    return { user, org, ...session };
  }

  async loginWithEmail({ email, password, userAgent, ip }) {
    const user = await db.User.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new Error('Account has been suspended or deactivated. Contact support.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const org = await this.ensureDefaultOrganization(user);
    const session = await sessionService.createSession(user, {
      userAgent,
      ip,
      organizationId: org.id,
    });

    return { user, org, ...session };
  }

  async handleGitHubCallback(code, { userAgent, ip } = {}) {
    const provider = getProvider('github');
    const { accessToken } = await provider.exchangeCodeForToken(code);
    const profile = await provider.getUserProfile(accessToken);

    let user = await db.User.findOne({
      where: { githubUserId: profile.id },
    });

    if (!user) {
      user = await db.User.findOne({
        where: { email: profile.email },
      });

      if (user) {
        user.githubUserId = profile.id;
        user.githubUsername = profile.username;
        user.githubAccessToken = accessToken;
        if (!user.avatarUrl) user.avatarUrl = profile.avatarUrl;
        await user.save();
      } else {
        const count = await db.User.count();
        const isAdmin = count === 0 || (process.env.ADMIN_EMAIL && profile.email && profile.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
        const role = isAdmin ? 'superadmin' : 'user';

        user = await db.User.create({
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          githubUserId: profile.id,
          githubUsername: profile.username,
          githubAccessToken: accessToken,
          role,
        });
      }
    } else {
      user.githubAccessToken = accessToken;
      user.githubUsername = profile.username;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const org = await this.ensureDefaultOrganization(user);
    const session = await sessionService.createSession(user, {
      userAgent,
      ip,
      organizationId: org.id,
    });

    return { user, org, ...session };
  }

  async handleBitbucketCallback(code, { userAgent, ip } = {}) {
    const provider = getProvider('bitbucket');
    const { accessToken, refreshToken } = await provider.exchangeCodeForToken(code);
    const profile = await provider.getUserProfile(accessToken);

    let user = await db.User.findOne({
      where: { bitbucketUserId: profile.id },
    });

    if (!user) {
      user = await db.User.findOne({
        where: { email: profile.email },
      });

      if (user) {
        user.bitbucketUserId = profile.id;
        user.bitbucketUsername = profile.username;
        user.bitbucketAccessToken = accessToken;
        user.bitbucketRefreshToken = refreshToken;
        if (!user.avatarUrl) user.avatarUrl = profile.avatarUrl;
        await user.save();
      } else {
        const count = await db.User.count();
        const isAdmin = count === 0 || (process.env.ADMIN_EMAIL && profile.email && profile.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
        const role = isAdmin ? 'superadmin' : 'user';

        user = await db.User.create({
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          bitbucketUserId: profile.id,
          bitbucketUsername: profile.username,
          bitbucketAccessToken: accessToken,
          bitbucketRefreshToken: refreshToken,
          role,
        });
      }
    } else {
      user.bitbucketAccessToken = accessToken;
      user.bitbucketRefreshToken = refreshToken;
      user.bitbucketUsername = profile.username;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const org = await this.ensureDefaultOrganization(user);
    const session = await sessionService.createSession(user, {
      userAgent,
      ip,
      organizationId: org.id,
    });

    return { user, org, ...session };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        throw new Error('Current password is required.');
      }
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new Error('Current password does not match.');
      }
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    logger.info({ userId: user.id }, '[AUTH] Password changed successfully');
    return { success: true, message: 'Password updated successfully' };
  }

  async forgotPassword({ email }) {
    if (!email) {
      throw new Error('Email address is required.');
    }

    const user = await db.User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return { success: true, message: 'If an account with this email exists, a reset link has been dispatched.' };
    }

    const hashSlice = (user.passwordHash || 'oauth-initial-hash').slice(-10);
    const token = jwt.sign(
      { userId: user.id, email: user.email, hashSlice },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    const resetUrl = `${config.appUrl}/reset-password?token=${token}`;

    await emailService.sendPasswordResetEmail({
      toEmail: user.email,
      toName: user.name,
      resetUrl,
    });

    return {
      success: true,
      message: 'If an account with this email exists, a reset link has been dispatched.',
      resetUrl: config.env !== 'production' ? resetUrl : undefined,
    };
  }

  async resetPassword({ token, newPassword }) {
    if (!token) {
      throw new Error('Password reset token is required.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new Error('The password reset link is invalid or has expired. Please request a new one.');
    }

    const user = await db.User.findByPk(decoded.userId);
    if (!user) {
      throw new Error('User account not found.');
    }

    const currentHashSlice = (user.passwordHash || 'oauth-initial-hash').slice(-10);
    if (decoded.hashSlice !== currentHashSlice) {
      throw new Error('This password reset link has already been used. Please request a new one.');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    logger.info({ userId: user.id }, '[AUTH] Password reset successfully via token');
    return { success: true, message: 'Password has been reset successfully. You can now sign in.' };
  }
}

module.exports = new AuthService();
