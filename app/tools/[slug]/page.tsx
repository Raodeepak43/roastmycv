import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolPageContent } from '@/components/tools/ToolPageContent'
import { getAllToolSlugs, getToolBySlug } from '@/lib/tools'
import { faqPageJsonLd, toolBreadcrumbJsonLd } from '@/lib/schema'
import { siteUrl } from '@/lib/seo'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug)
  if (!tool) return { title: 'Tool Not Found' }

  const url = siteUrl(`/tools/${tool.slug}`)

  return {
    title: tool.title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: tool.title,
      description: tool.metaDescription,
      url,
      siteName: 'MyCVRoast',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export default function ToolPage({ params }: PageProps) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolBreadcrumbJsonLd(tool.h1, tool.slug)) }}
      />
      {tool.faq && tool.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(tool.faq)) }}
        />
      )}
      <ToolPageContent tool={tool} />
    </>
  )
}
