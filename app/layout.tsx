import type { Metadata, Viewport } from 'next'
import { Inter_Tight, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ConsentScripts } from '@/components/ConsentScripts'
import { AuthHashRedirect } from '@/components/auth/AuthHashRedirect'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { GoogleAnalyticsConsent } from '@/components/GoogleAnalyticsConsent'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'
import { googleAnalyticsHeadScripts } from '@/lib/analytics/gtag-head'
import { siteJsonLd } from '@/lib/schema'
import { hreflangAlternates } from '@/lib/hreflang'
import {
  DEFAULT_OG_IMAGE,
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  LLMS_FULL_TXT_URL,
  LLMS_TXT_URL,
  pageMetadata,
  SITE_APPLICATION_NAME,
  SITE_THEME_COLOR,
  siteUrl,
  SITE_URL,
  TWITTER_SITE,
} from '@/lib/seo'
import './globals.css'
import './elevate-theme.css'
import './career-tools/career-tools.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
})

const gaId = GA_MEASUREMENT_ID

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: SITE_THEME_COLOR,
}

export const metadata: Metadata = {
  ...pageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
    keywords: HOME_KEYWORDS,
  }),
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_APPLICATION_NAME,
  authors: [{ name: 'MyCVRoast', url: SITE_URL }],
  creator: '@deepak_yadav82',
  publisher: 'MyCVRoast',
  category: 'BusinessApplication',
  alternates: {
    canonical: siteUrl('/'),
    languages: hreflangAlternates(),
  },
  openGraph: {
    ...pageMetadata({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: '/',
    }).openGraph,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_SITE,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
    creator: '@deepak_yadav82',
  },
  verification: {
    google: '45rPCZJdtfkjEph7g-f9UKWrYI4_5F6Jcv-eeZHbsH0',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${spaceGrotesk.variable} elevate-site`}>
      <head>
        {/* Google tag (gtag.js) — immediately after <head> per Google Analytics install */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsHeadScripts(gaId) }} />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="sitemap" type="application/xml" href={siteUrl('/sitemap.xml')} />
        <link rel="alternate" type="text/plain" href={LLMS_TXT_URL} title="LLMs.txt" />
        <link rel="alternate" type="text/plain" href={LLMS_FULL_TXT_URL} title="LLMs full knowledge base" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="MyCVRoast Blog"
          href={siteUrl('/blog/rss.xml')}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={`${interTight.className} font-body antialiased bg-bg-beige text-text-dark`}>
        <AuthHashRedirect />
        {children}
        <CookieConsentBanner />
        <GoogleAnalyticsConsent />
        <ConsentScripts />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
