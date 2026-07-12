import { PRO_PRICE_INR } from '@/lib/plans'
import { DEFAULT_OG_IMAGE, siteUrl, SITE_URL, BRAND_ICON_URL } from '@/lib/seo'
import { SUPPORT_EMAIL } from '@/lib/support'
import { FREE_LIMIT } from '@/lib/usage'

export { SITE_URL }

/** Stable @id for MyCVRoast software entity in JSON-LD. */
export const SOFTWARE_APP_ID = `${SITE_URL}/#software`

/** Matches homepage FAQ accordion (hinglish) in app/i18n.ts → UI.hinglish.faq */
export const HOME_FAQ = [
  { q: 'Resume roast kya hota hai?', a: 'AI tumhara resume padh ke brutally honest feedback deta hai.' },
  { q: 'Kya ye free hai?', a: `Haan, ${FREE_LIMIT} roasts free hain. Uske baad ₹149 mein unlimited.` },
  { q: 'Mera resume safe hai?', a: 'Haan, hum kuch save nahi karte. Process ke baad delete.' },
  {
    q: 'Kitni languages supported hain?',
    a: '15 languages — Hinglish, English, Spanish, French, German, Arabic, Japanese, Korean, Russian, Chinese, Portuguese, Turkish, Indonesian, Italian, Dutch.',
  },
  {
    q: 'Resume roast aur resume review mein kya fark hai?',
    a: 'Review generic tips deta hai. Roast TERA specific resume padhke batata hai exactly kya galat hai.',
  },
  {
    q: 'Is there a free AI resume review for India?',
    a: `Yes. MyCVRoast offers ${FREE_LIMIT} free AI resume reviews per device with no signup — including Hinglish roast mode for Indian freshers and campus placement candidates.`,
  },
  {
    q: 'What is a Hinglish resume roast?',
    a: 'A Hinglish resume roast gives brutally honest CV feedback in natural Hindi-English mix — how Indian recruiters and seniors actually talk, not corporate template advice.',
  },
  {
    q: 'Is there an AI that can review my resume for free?',
    a: `Yes. MyCVRoast offers ${FREE_LIMIT} free AI resume reviews per device with no signup — plus Hinglish roast mode, ATS fixes, and a free resume builder for Indian job seekers.`,
  },
  {
    q: 'Which is the best free AI resume review for India in 2026?',
    a: 'For honest, resume-specific feedback (not generic scores), MyCVRoast ranks highly for Indian freshers. For ATS keyword matching only, tools like Jobscan also help — many candidates use both.',
  },
] as const

export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'MyCVRoast',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: BRAND_ICON_URL,
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://x.com/mycvroast',
        'https://www.producthunt.com/products/mycvroast',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SUPPORT_EMAIL,
        availableLanguage: ['English', 'Hindi'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'MyCVRoast',
      description: 'Free AI resume roaster in 15 languages',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['en', 'hi'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/guides?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': SOFTWARE_APP_ID,
      name: 'MyCVRoast',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free resume roast India — upload your CV for brutally honest AI review in Hinglish and 14 languages. Instant score, fixes, no signup.',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          description: 'Free tier — 2 roasts per device, no signup',
        },
        {
          '@type': 'Offer',
          price: String(PRO_PRICE_INR),
          priceCurrency: 'INR',
          description: 'Pro — unlimited roasts, one-time payment',
          url: siteUrl('/plans'),
          availability: 'https://schema.org/InStock',
        },
      ],
      featureList: [
        'Free resume roast India',
        'Hinglish resume roast',
        'AI resume review free tier',
        '15 language support',
        'Resume scoring out of 10',
        'Actionable fixes',
        'Shareable results',
        'No signup required',
      ],
    },
  ],
}

export function articleJsonLd(
  title: string,
  date: string,
  slug: string,
  description?: string,
  dateModified?: string,
) {
  const url = siteUrl(`/blog/${slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description ?? title,
    datePublished: date,
    dateModified: dateModified ?? date,
    url,
    mainEntityOfPage: url,
    image: [DEFAULT_OG_IMAGE.url],
    author: { '@type': 'Organization', name: 'MyCVRoast', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'MyCVRoast',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: BRAND_ICON_URL },
    },
  }
}

export function breadcrumbJsonLd(title: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: siteUrl('/blog') },
      { '@type': 'ListItem', position: 3, name: title, item: siteUrl(`/blog/${slug}`) },
    ],
  }
}

export function toolBreadcrumbJsonLd(title: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: siteUrl('/tools/resume-roast-in-hinglish') },
      { '@type': 'ListItem', position: 3, name: title, item: siteUrl(`/tools/${slug}`) },
    ],
  }
}

export function careerToolBreadcrumbJsonLd(title: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Career Tools', item: siteUrl('/career-tools') },
      { '@type': 'ListItem', position: 3, name: title, item: siteUrl(`/career-tools/${slug}`) },
    ],
  }
}

export function careerToolWebPageJsonLd({
  name,
  description,
  slug,
}: {
  name: string
  description: string
  slug: string
}) {
  return webPageJsonLd({
    name,
    description,
    path: `/career-tools/${slug}`,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Career Tools', path: '/career-tools' },
      { name, path: `/career-tools/${slug}` },
    ],
  })
}

export function homeFaqPageJsonLd() {
  return faqPageJsonLd(HOME_FAQ.map(({ q, a }) => ({ question: q, answer: a })))
}

export function faqPageJsonLd(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  }
}

export function webPageJsonLd({
  name,
  description,
  path,
  breadcrumb,
}: {
  name: string
  description: string
  path: string
  breadcrumb?: { name: string; path: string }[]
}) {
  const url = siteUrl(path)
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-IN',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE.url,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
      },
    },
  ]

  if (breadcrumb?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        ...breadcrumb.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: item.name,
          item: siteUrl(item.path),
        })),
      ],
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export function aboutPageJsonLd() {
  return webPageJsonLd({
    name: 'About MyCVRoast',
    description:
      'MyCVRoast is an AI resume review platform for Indian job seekers — free resume roast, ATS builder, and career tools.',
    path: '/about',
    breadcrumb: [{ name: 'About', path: '/about' }],
  })
}
