import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { siteJsonLd } from '@/lib/schema'
import './globals.css'

const gaId = process.env.NEXT_PUBLIC_GA_ID

const SITE_URL = 'https://mycvroast.in'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'MyCVRoast — Free AI Resume Roaster | Brutal Honest Feedback',
  description: 'Get your resume brutally roasted by AI in Hinglish, English, Spanish and 12 more languages. Free, instant, no signup. Find out why recruiters are rejecting you.',
  keywords: 'resume roast, AI resume review, free resume checker, hinglish resume roast, resume roaster India, AI resume analyzer, brutal resume feedback, resume score, mycvroast, my cv roast',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'MyCVRoast — AI Roasts Your Resume Brutally 🔥',
    description: 'Upload your resume. AI destroys it. You fix it. You get hired. Free, instant, 15 languages.',
    url: SITE_URL,
    siteName: 'MyCVRoast',
    images: [{
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'MyCVRoast - AI Resume Roaster',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyCVRoast — AI Roasts Your Resume Brutally 🔥',
    description: 'Upload your resume. AI destroys it. You fix it. You get hired.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@deepak_yadav82',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: '45rPCZJdtfkjEph7g-f9UKWrYI4_5F6Jcv-eeZHbsH0',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="45rPCZJdtfkjEph7g-f9UKWrYI4_5F6Jcv-eeZHbsH0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8959559679161401"
          crossOrigin="anonymous"
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="font-body antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
