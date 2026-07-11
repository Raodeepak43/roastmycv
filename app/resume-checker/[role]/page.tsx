import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout'
import {
  getAllRoleCheckerSlugs,
  getRoleCheckerBySlug,
} from '@/lib/seo-pages/registry'
import { faqPageJsonLd } from '@/lib/schema'
import { pageMetadata, siteUrl } from '@/lib/seo'

interface PageProps {
  params: { role: string }
}

export function generateStaticParams() {
  return getAllRoleCheckerSlugs().map((role) => ({ role }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getRoleCheckerBySlug(params.role)
  if (!page) return { title: 'Not Found' }

  return pageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/resume-checker/${page.slug}`,
    keywords: page.keywordMeta,
  })
}

export default function RoleCheckerPage({ params }: PageProps) {
  const page = getRoleCheckerBySlug(params.role)
  if (!page) notFound()

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Resume Checker', item: siteUrl('/ats-score-checker') },
      { '@type': 'ListItem', position: 3, name: page.h1, item: siteUrl(`/resume-checker/${page.slug}`) },
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
      <SeoLandingLayout
        page={page}
        variant="role-checker"
        breadcrumbParent={{ label: 'Resume Checker', href: '/ats-score-checker' }}
      />
    </>
  )
}
