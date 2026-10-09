const fs = require('fs');
const config = require('../../config');

let appInstance;

function getResolvedPrivateKey() {
  let privateKey = config.github.privateKey || process.env.GITHUB_APP_PRIVATE_KEY || process.env.GITHUB_PRIVATE_KEY;
  if (!privateKey && config.github.privateKeyPath && fs.existsSync(config.github.privateKeyPath)) {
    try {
      privateKey = fs.readFileSync(config.github.privateKeyPath, 'utf8');
    } catch (e) {
      // fallback
    }
  }

  if (!privateKey) return null;

  privateKey = privateKey.trim();
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }

  if (!privateKey.includes('-----BEGIN') && !privateKey.includes('-----BEGIN RSA')) {
    try {
      const cleanB64 = privateKey.replace(/\s+/g, '');
      const decoded = Buffer.from(cleanB64, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        privateKey = decoded;
      }
    } catch (err) {
      // ignore and fallback
    }
  }

  return privateKey.replace(/\\n/g, '\n');
}

/**
 * Lazily constructs the App singleton — not built at require-time, so the process can
 * still boot (e.g. for local dev without GitHub App credentials yet configured) and only
 * fails when a GitHub-dependent code path is actually hit.
 *
 * @octokit/app (v15+) ships as a pure ESM package, so it's loaded via dynamic import()
 * rather than require() — this file itself stays CommonJS, matching the rest of `apps/api`.
 */
async function getApp() {
  if (!appInstance) {
    const privateKey = getResolvedPrivateKey();
    if (!config.github.appId || !privateKey) {
      throw new Error(
        'GitHub App is not configured — set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY',
      );
    }

    const { App } = await import('@octokit/app');

    appInstance = new App({
      appId: config.github.appId,
      privateKey,
    });
  }

  return appInstance;
}

/**
 * Resolves a valid numeric GitHub installation ID from either a numeric string/number
 * or from a PostgreSQL Installation/Repository UUID record.
 */
async function resolveNumericInstallationId(installationId) {
  if (!installationId) return null;
  const strId = String(installationId).trim();
  if (/^\d+$/.test(strId)) {
    return Number(strId);
  }

  try {
    const db = require('../../models');
    // 1. Try finding Installation by primary key (UUID)
    let inst = await db.Installation.findByPk(installationId);
    if (inst && inst.providerInstallationId && /^\d+$/.test(String(inst.providerInstallationId))) {
      return Number(inst.providerInstallationId);
    }

    // 2. Try finding by Repository if installationId passed was a repo UUID
    const repo = await db.Repository.findByPk(installationId, {
      include: [{ model: db.Installation, as: 'installation' }],
    });
    if (repo && repo.installation && repo.installation.providerInstallationId) {
      if (/^\d+$/.test(String(repo.installation.providerInstallationId))) {
        return Number(repo.installation.providerInstallationId);
      }
    }

    // 3. Fallback: find any GitHub installation in this workspace
    const anyInst = await db.Installation.findOne({
      where: { provider: 'github' },
      order: [['createdAt', 'DESC']],
    });
    if (anyInst && anyInst.providerInstallationId && /^\d+$/.test(String(anyInst.providerInstallationId))) {
      return Number(anyInst.providerInstallationId);
    }
  } catch (err) {
    // ignore
  }

  return null;
}

/**
 * Returns an Octokit instance authenticated as the given installation (short-lived
 * installation access token, cached/refreshed internally by @octokit/app — ADR-007).
 * This is the only way the rest of the codebase should get a GitHub client.
 */
async function getInstallationOctokit(installationId) {
  const app = await getApp();
  const numericId = await resolveNumericInstallationId(installationId);
  if (!numericId) {
    throw new Error(
      `Cannot authenticate GitHub installation: missing or invalid numeric installation ID (received: ${installationId})`,
    );
  }
  return app.getInstallationOctokit(numericId);
}

/**
 * Returns a raw GitHub installation access token string for cloning or passing to external services.
 */
async function getInstallationToken(installationId) {
  const octokit = await getInstallationOctokit(installationId);
  const auth = await octokit.auth({ type: 'installation' });
  return auth.token;
}

module.exports = { getApp, getInstallationOctokit, getInstallationToken, resolveNumericInstallationId };
