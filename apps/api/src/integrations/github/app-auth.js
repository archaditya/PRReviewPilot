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
 * Returns an Octokit instance authenticated as the given installation (short-lived
 * installation access token, cached/refreshed internally by @octokit/app — ADR-007).
 * This is the only way the rest of the codebase should get a GitHub client.
 */
async function getInstallationOctokit(installationId) {
  const app = await getApp();
  return app.getInstallationOctokit(installationId);
}

/**
 * Returns a raw GitHub installation access token string for cloning or passing to external services.
 */
async function getInstallationToken(installationId) {
  const octokit = await getInstallationOctokit(installationId);
  const auth = await octokit.auth({ type: 'installation' });
  return auth.token;
}

module.exports = { getApp, getInstallationOctokit, getInstallationToken };
