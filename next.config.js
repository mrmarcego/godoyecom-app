/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // El proyecto se valida en CI/build manual; no bloquear el build por lint.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
