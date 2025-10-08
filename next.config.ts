/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  images: {
    unoptimized: true,
  },
  basePath: "/kumma-portfolio",
  assetPrefix: "/kumma-portfolio",
}

module.exports = nextConfig
