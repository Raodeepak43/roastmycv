import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout'
import {
  getAllToolLandingSlugs,
  getToolLandingBySlug,
} from '@/lib/seo-pages/registry'
import { faqPageJsonLd } from '@/lib/schema'
import { pageMetadata, siteUrl } from '@/lib/seo'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllToolLandingSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getToolLandingBySlug(params.slug)
  if (!page) return { title: 'Not Found' }

  return pageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/${page.slug}`,
    keywords: page.keywordMeta,
  })
}

export default function ToolLandingPage({ params }: PageProps) {
  const page = getToolLandingBySlug(params.slug)
  if (!page) notFound()

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: page.h1, item: siteUrl(`/${page.slug}`) },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {page.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(page.faq)) }}
        />
      )}
      <SeoLandingLayout page={page} variant="tool-landing" />
    </>
  )
}
