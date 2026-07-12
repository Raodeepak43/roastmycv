import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CareerToolLanding } from '@/components/marketing/CareerToolLanding'
import { getCareerToolFaq } from '@/lib/tools/marketing/landing-extras'
import { getAllCareerToolSlugs, getCareerToolMarketing } from '@/lib/tools/marketing/config'
import {
  careerToolBreadcrumbJsonLd,
  careerToolWebPageJsonLd,
  faqPageJsonLd,
} from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllCareerToolSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getCareerToolMarketing(params.slug)
  if (!tool) return {}
  return pageMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    path: `/career-tools/${tool.slug}`,
    keywords: tool.keywords.join(', '),
  })
}

export default function CareerToolPage({ params }: Props) {
  const tool = getCareerToolMarketing(params.slug)
  if (!tool) notFound()

  const faq = getCareerToolFaq(tool.slug, tool.headline, tool.whatItDoes, tool.freeVsPro)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(careerToolBreadcrumbJsonLd(tool.headline, tool.slug)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            careerToolWebPageJsonLd({
              name: tool.headline,
              description: tool.seoDescription,
              slug: tool.slug,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faq)) }}
      />
      <CareerToolLanding tool={tool} />
    </>
  )
}
