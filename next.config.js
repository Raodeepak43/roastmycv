/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || String(Date.now()),
    // Expose Supabase to browser for auth (anon key only — never service role)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
  experimental: { serverComponentsExternalPackages: ['pdf-parse'] },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}
module.exports = nextConfig
