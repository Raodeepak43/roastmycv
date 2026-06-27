import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogSlugs, getPostBySlug, formatBlogDate } from '@/lib/blog'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/schema'
import { BlogBreadcrumb, BlogCta, BlogFooter, BlogHeader } from '@/components/BlogChrome'
import { BlogFeaturedBanner } from '@/components/BlogFeaturedBanner'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: `${post.title} | MyCVRoast Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://mycvroast.in/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://mycvroast.in/blog/${post.slug}`,
      siteName: 'MyCVRoast',
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <BlogHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post.title, post.date, post.slug)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(post.title, post.slug)) }}
      />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 w-full">
        <BlogBreadcrumb title={post.title} />
        <article>
          <BlogFeaturedBanner title={post.title} slug={post.slug} />
          <time className="font-body text-[11px] text-muted uppercase tracking-wider">{formatBlogDate(post.date)}</time>
          <h1 className="font-display text-3xl md:text-4xl text-white mt-2 mb-6 leading-tight">{post.title}</h1>
          <div
            className="blog-prose font-body text-[15px] text-[#CCCCCC] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
        <BlogCta />
      </main>
      <BlogFooter />
    </div>
  )
}
