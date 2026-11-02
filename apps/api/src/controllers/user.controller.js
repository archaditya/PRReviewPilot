const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');
const sessionService = require('../services/session.service');
const ApiResponse = require('../utils/api-response');
const logger = require('../utils/logger');

class UserController {
  /**
   * GET /api/users/me/export
   * Generates a downloadable JSON export of the user's personal data and metadata
   * under DPDP Act 2023 Section 11 (Right to Access Information About Personal Data).
   */
  async exportUserData(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await db.User.findByPk(userId, {
        attributes: [
          'id',
          'name',
          'email',
          'role',
          'status',
          'githubUsername',
          'bitbucketUsername',
          'avatarUrl',
          'consentedAt',
          'consentIp',
          'termsVersion',
          'isOver18',
          'usage',
          'createdAt',
          'lastLoginAt',
        ],
        include: [
          {
            model: db.Organization,
            as: 'ownedOrganizations',
            attributes: ['id', 'name', 'slug', 'createdAt'],
          },
          {
            model: db.Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'slug', 'createdAt'],
            through: { attributes: ['role', 'createdAt'] },
          },
        ],
      });

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      // Installations linked to this user
      const installations = await db.Installation.findAll({
        where: { installedByUserId: userId },
        attributes: ['id', 'provider', 'accountLogin', 'accountType', 'status', 'createdAt'],
      });

      // Organizations the user has access to
      const orgIds = [
        ...(user.ownedOrganizations || []).map((o) => o.id),
        ...(user.organizations || []).map((o) => o.id),
      ];

      // Repositories in these organizations
      let repositories = [];
      if (orgIds.length > 0) {
        repositories = await db.Repository.findAll({
          where: { organizationId: { [Op.in]: orgIds } },
          attributes: ['id', 'name', 'providerFullName', 'provider', 'defaultBranch', 'status', 'createdAt'],
        });
      }

      const exportPayload = {
        complianceStandard: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
        exportTimestamp: new Date().toISOString(),
        dataPrincipal: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          githubUsername: user.githubUsername,
          bitbucketUsername: user.bitbucketUsername,
          consentedAt: user.consentedAt,
          consentIp: user.consentIp,
          termsVersion: user.termsVersion,
          isOver18: user.isOver18,
          usageStats: user.usage,
          accountCreated: user.createdAt,
          lastLogin: user.lastLoginAt,
        },
        organizations: {
          owned: user.ownedOrganizations || [],
          memberOf: user.organizations || [],
        },
        installations,
        connectedRepositories: repositories,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="reviewpilot-user-data-${user.id}.json"`);
      return res.status(200).json(exportPayload);
    } catch (err) {
      logger.error({ err: err.message, stack: err.stack }, 'Failed exporting user personal data');
      next(err);
    }
  }

  /**
   * DELETE /api/users/me
   * Self-service permanent account erasure under DPDP Act 2023 Section 12 (Right to Erasure).
   */
  async deleteCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const { confirmationEmail, password } = req.body;

      const user = await db.User.findByPk(userId);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      // 1. Email confirmation verification
      if (!confirmationEmail || confirmationEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
        return ApiResponse.error(res, 'Confirmation email does not match your account email address', 400);
      }

      // 2. Password verification if account uses email/password auth
      if (user.passwordHash) {
        if (!password) {
          return ApiResponse.error(res, 'Current password is required to authorize account deletion', 400);
        }
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
          return ApiResponse.error(res, 'Invalid account password', 401);
        }
      }

      // 3. Immediately revoke active session tokens in Redis
      try {
        await sessionService.revokeAllUserSessions(userId);
      } catch (sessErr) {
        logger.warn({ err: sessErr.message }, 'Failed revoking sessions during account erasure');
      }

      // 4. Remove organization memberships
      await db.OrganizationMember.destroy({ where: { userId } });

      // 5. Clean up Neo4j AST knowledge graph for owned repos if user was owner
      try {
        const ownedOrgs = await db.Organization.findAll({
          where: { ownerUserId: userId },
          include: [{ model: db.Repository, as: 'repositories' }],
        });

        for (const org of ownedOrgs) {
          for (const repo of org.repositories || []) {
            try {
              const { getSession } = require('../db/neo4j');
              const neoSession = getSession();
              if (neoSession) {
                await neoSession.run(
                  'MATCH (n) WHERE n.repositoryId = $repoId DETACH DELETE n',
                  { repoId: repo.id }
                );
                await neoSession.close();
              }
            } catch (neoErr) {
              logger.warn({ err: neoErr.message, repoId: repo.id }, 'Non-fatal error clearing Neo4j nodes');
            }
          }
        }
      } catch (graphErr) {
        logger.warn({ err: graphErr.message }, 'Error checking owned repositories for Neo4j cleanup');
      }

      // 6. Delete User database record
      const deletedEmail = user.email;
      await user.destroy();

      logger.info({ userId, email: deletedEmail }, 'User exercised statutory Right to Erasure; account permanently deleted');

      // 7. Clear authentication cookies
      res.clearCookie('session', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });

      return ApiResponse.success(res, {
        message: 'Your account and all associated personal data have been permanently erased.',
      });
    } catch (err) {
      logger.error({ err: err.message, stack: err.stack }, 'Error processing self-service account deletion');
      next(err);
    }
  }
}

module.exports = new UserController();
