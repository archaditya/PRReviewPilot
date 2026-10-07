const bcrypt = require('bcryptjs');
const db = require('../models');
const config = require('../config');
const { getProvider } = require('../integrations/providers');
const sessionService = require('./session.service');
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

    const user = await db.User.create({
      email,
      name,
      passwordHash,
      emailVerified: false,
      role: 'user',
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
        user = await db.User.create({
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          githubUserId: profile.id,
          githubUsername: profile.username,
          githubAccessToken: accessToken,
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
        user = await db.User.create({
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          bitbucketUserId: profile.id,
          bitbucketUsername: profile.username,
          bitbucketAccessToken: accessToken,
          bitbucketRefreshToken: refreshToken,
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
}

module.exports = new AuthService();
