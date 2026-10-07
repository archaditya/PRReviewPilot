const GitHubProvider = require('./github.provider');
const BitbucketProvider = require('./bitbucket.provider');

const githubProvider = new GitHubProvider();
const bitbucketProvider = new BitbucketProvider();

function getProvider(providerName) {
  const normalized = (providerName || '').toLowerCase();
  if (normalized === 'github') return githubProvider;
  if (normalized === 'bitbucket') return bitbucketProvider;
  throw new Error(`Unsupported git provider: ${providerName}`);
}

module.exports = {
  getProvider,
  githubProvider,
  bitbucketProvider,
};
