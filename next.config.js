/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  async headers() {
    return [
      {
        source: '/audio/:path*',
        headers: [
          { key: 'Content-Type', value: 'audio/mpeg' },
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
