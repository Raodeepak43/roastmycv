/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '',
    // Expose Supabase to browser for auth (anon key only — never service role)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DASHBOARD_URL:
      process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.mycvroast.in',
    NEXT_PUBLIC_DASHBOARD_HOST:
      process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.mycvroast.in',
    NEXT_PUBLIC_SUPPORT_EMAIL:
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@mycvroast.in',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || 'G-XS1LMJZ63K',
    // Public OAuth client ID (safe to embed — not a secret)
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '165461576516-k533qju7a3k9gq99g7tgnilh2hq72314.apps.googleusercontent.com',
  },
  experimental: { serverComponentsExternalPackages: ['pdf-parse'] },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'mycvroast.in' }],
        destination: 'https://www.mycvroast.in/:path*',
        permanent: true,
      },
      {
        source: '/free-resume-checker',
        destination: '/best-resume-checker-india',
        permanent: true,
      },
      {
        source: '/roast-my-resume',
        destination: '/',
        permanent: true,
      },
      {
        source: '/is-my-resume-ats-friendly',
        destination: '/ats-friendly-resume-checker',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/dashboard/:path*',
        headers: [{ key: 'CDN-Cache-Control', value: 'no-store' }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'CDN-Cache-Control', value: 'no-store' }],
      },
      {
        source: '/login',
        headers: [{ key: 'CDN-Cache-Control', value: 'no-store' }],
      },
      {
        source: '/auth/:path*',
        headers: [{ key: 'CDN-Cache-Control', value: 'no-store' }],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}
module.exports = nextConfig
