import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CareerToolLanding } from '@/components/marketing/CareerToolLanding'
import { getAllCareerToolSlugs, getCareerToolMarketing } from '@/lib/tools/marketing/config'
import { siteUrl } from '@/lib/seo'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllCareerToolSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getCareerToolMarketing(params.slug)
  if (!tool) return {}
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: { canonical: siteUrl(`/career-tools/${tool.slug}`) },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: siteUrl(`/career-tools/${tool.slug}`),
    },
  }
}

export default function CareerToolPage({ params }: Props) {
  const tool = getCareerToolMarketing(params.slug)
  if (!tool) notFound()
  return <CareerToolLanding tool={tool} />
}
