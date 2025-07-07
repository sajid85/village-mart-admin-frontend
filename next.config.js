/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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