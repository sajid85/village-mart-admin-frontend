/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:4000/admin/:path*',
      },
      {
        source: '/orders/:path*',
        destination: 'http://localhost:4000/orders/:path*',
      },
      {
        source: '/users/:path*',
        destination: 'http://localhost:4000/users/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 