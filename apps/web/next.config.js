/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'secure.gravatar.com', 'bitbucket.org'],
  },
};

module.exports = nextConfig;
