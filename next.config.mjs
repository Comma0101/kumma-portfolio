/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Next 14's dev server rejects dynamicParams: false under static export.
  // Production still exports every published route for GitHub Pages.
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  trailingSlash: true,
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  images: {
    unoptimized: true,
  },
}

export default nextConfig;
