/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    disableStaticImages: false,
  },
  env: {
    // Variáveis públicas (NEXT_PUBLIC_*) serão incluídas no bundle
    // Variáveis privadas vêm de .env.local
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
