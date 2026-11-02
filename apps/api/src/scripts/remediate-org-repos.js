/**
 * Data Remediation Script: Disentangle Multi-Tenant Installations & Repositories
 *
 * Scans all installations and repositories, ensuring distinct GitHub accounts
 * (e.g. archaditya vs adityaSpire10) have separate, dedicated organizations,
 * and fixes all organization_id foreign keys in PostgreSQL.
 *
 * Run: node apps/api/src/scripts/remediate-org-repos.js
 */

const { Op } = require('sequelize');
const db = require('../models');
const logger = require('../utils/logger');

async function remediate() {
  try {
    logger.info('Starting multi-tenant database remediation...');

    await db.sequelize.authenticate();
    logger.info('Database connection verified.');

    // 1. Fetch all installations
    const installations = await db.Installation.findAll({
      include: [{ model: db.Repository, as: 'repositories' }],
    });

    logger.info(`Found ${installations.length} total installations in database.`);

    for (const inst of installations) {
      const accountLogin = inst.accountLogin;
      if (!accountLogin) {
        logger.warn({ instId: inst.id }, 'Skipping installation with missing accountLogin');
        continue;
      }

      logger.info(`Processing installation: ${accountLogin} (ID: ${inst.providerInstallationId}, DB ID: ${inst.id})`);

      // 2. Find or create a dedicated organization for this accountLogin
      let org = await db.Organization.findOne({
        where: { slug: accountLogin.toLowerCase() },
      });

      if (!org) {
        // Try finding matching user to associate ownership
        const matchedUser = await db.User.findOne({
          where: {
            [Op.or]: [
              { githubUsername: { [Op.iLike]: accountLogin } },
              { email: { [Op.iLike]: `%${accountLogin}%` } },
            ],
          },
        });

        org = await db.Organization.create({
          name: `${accountLogin}'s Workspace`,
          slug: accountLogin.toLowerCase(),
          ownerUserId: matchedUser ? matchedUser.id : inst.installedByUserId || null,
        });

        logger.info(`Created dedicated organization for ${accountLogin} (Org ID: ${org.id})`);

        if (matchedUser) {
          await db.OrganizationMember.findOrCreate({
            where: { organizationId: org.id, userId: matchedUser.id },
            defaults: {
              organizationId: org.id,
              userId: matchedUser.id,
              role: 'owner',
              status: 'active',
            },
          });
          logger.info(`Added user ${matchedUser.email} as owner of organization ${org.name}`);
        }
      } else {
        logger.info(`Using existing organization ${org.name} (Org ID: ${org.id}) for ${accountLogin}`);
      }

      // 3. Update Installation organizationId & installedByUserId
      let instModified = false;
      if (inst.organizationId !== org.id) {
        logger.info(`Re-linking installation ${inst.id} from Org ${inst.organizationId} -> ${org.id}`);
        inst.organizationId = org.id;
        instModified = true;
      }

      if (matchedUser && inst.installedByUserId !== matchedUser.id) {
        logger.info(`Reassigning installedByUserId on installation ${inst.id} (${accountLogin}) to ${matchedUser.email} (${matchedUser.id})`);
        inst.installedByUserId = matchedUser.id;
        instModified = true;
      } else if (!matchedUser && inst.installedByUserId) {
        const currentUser = await db.User.findByPk(inst.installedByUserId);
        if (currentUser && currentUser.githubUsername && currentUser.githubUsername.toLowerCase() !== accountLogin.toLowerCase()) {
          logger.info(`Disassociating installation ${inst.id} (${accountLogin}) from unrelated user ${currentUser.email}`);
          inst.installedByUserId = null;
          instModified = true;
        }
      }

      if (instModified) {
        await inst.save();
      }

      // 4. Update all repositories for this installation or matching accountLogin prefix
      const repos = await db.Repository.findAll({
        where: {
          [Op.or]: [
            { installationId: inst.id },
            { providerFullName: { [Op.iLike]: `${accountLogin}/%` } },
          ],
        },
      });

      logger.info(`Found ${repos.length} repositories belonging to ${accountLogin}`);

      for (const repo of repos) {
        let changed = false;
        if (repo.organizationId !== org.id) {
          logger.info(`Updating repository ${repo.providerFullName}: Org ${repo.organizationId} -> ${org.id}`);
          repo.organizationId = org.id;
          changed = true;
        }
        if (repo.installationId !== inst.id) {
          repo.installationId = inst.id;
          changed = true;
        }
        if (changed) {
          await repo.save();
        }
      }
    }

    // 5. Final verification summary
    logger.info('--- Remediation Verification Summary ---');
    const allOrgs = await db.Organization.findAll({
      include: [{ model: db.Repository, as: 'repositories' }],
    });

    for (const org of allOrgs) {
      const repoNames = (org.repositories || []).map((r) => r.providerFullName);
      logger.info(`Org: "${org.name}" (slug: ${org.slug}, id: ${org.id}) -> ${repoNames.length} repos: [${repoNames.join(', ')}]`);
    }

    logger.info('✓ Remediation completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack }, 'Remediation failed');
    process.exit(1);
  }
}

if (require.main === module) {
  remediate();
}

module.exports = remediate;
