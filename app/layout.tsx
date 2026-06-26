import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const SITE_URL = 'https://roastmycv-coral.vercel.app'
const OG_IMAGE = `${SITE_URL}/og`

const SEO_TITLE = 'RoastMyCV — Free AI Resume Roaster in Hinglish | Get Brutally Honest Feedback'
const SEO_DESC = 'Free AI resume roaster in 15 languages — Hinglish, English, Spanish, French, German, Arabic, Japanese, Korean, Russian, Chinese and more. Brutal honest feedback. Instant. No signup.'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'RoastMyCV',
  description: 'Free AI resume roaster in 15 languages',
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESC,
  keywords: 'resume roast, AI resume feedback, resume review India, hinglish resume roast, free resume checker',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESC,
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
