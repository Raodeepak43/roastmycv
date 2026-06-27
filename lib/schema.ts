export const SITE_URL = 'https://mycvroast.in'

export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'MyCVRoast',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [
        'https://x.com/mycvroast',
        'https://www.producthunt.com/products/get-brutally-honest-feedback',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'MyCVRoast',
      description: 'Free AI resume roaster in 15 languages',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/blog?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'MyCVRoast',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Upload your resume and get brutally honest AI feedback in 15 languages. Free, instant, no signup.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      featureList: [
        'AI resume roasting',
        '15 language support',
        'Resume scoring out of 10',
        'Actionable fixes',
        'Shareable results',
        'No signup required',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a resume roast?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A resume roast is brutal honest AI feedback on your resume. AI reads your actual resume and tells you exactly what recruiters think, then gives real fixes.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is MyCVRoast free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, the first 5 roasts are free with no signup. After that, unlock unlimited for a one-time fee.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which languages are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '15 languages including Hinglish, English, Spanish, Portuguese, French, German, Arabic, Japanese, Korean, Russian, Chinese, Turkish, Indonesian, Italian and Dutch.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my resume data safe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We do not store your resume. It is processed instantly by AI and deleted. No tracking, no data selling.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is this different from other resume checkers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most checkers give generic advice. MyCVRoast reads YOUR specific resume and gives specific feedback referencing your actual content, in 15 languages.',
          },
        },
      ],
    },
  ],
}

export function articleJsonLd(title: string, date: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: date,
    url: `${SITE_URL}/blog/${slug}`,
    author: { '@type': 'Organization', name: 'MyCVRoast' },
    publisher: { '@type': 'Organization', name: 'MyCVRoast', url: SITE_URL },
  }
}

export function breadcrumbJsonLd(title: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}/blog/${slug}` },
    ],
  }
}
