/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/brady-runs',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
