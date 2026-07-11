import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogSlugs, getPostBySlug, getPostLastModified } from '@/lib/blog'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/schema'
import { DEFAULT_OG_IMAGE, blogHeadline, blogSerpTitle, siteUrl } from '@/lib/seo'
import { BlogBreadcrumb, BlogCta, BlogFooter, BlogHeader } from '@/components/BlogChrome'
import { BlogFeaturedBanner } from '@/components/BlogFeaturedBanner'
import {
  BlogArticleMeta,
  BlogFaqSection,
  BlogInlineCta,
  BlogRelatedStrip,
} from '@/components/BlogArticleExtras'
import { getRelatedPosts } from '@/lib/blog/related'
import { blogCategoryForSlug } from '@/lib/blog/post-cta'
import { isGscPriorityBlog } from '@/lib/blog/gsc-priority'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Post Not Found' }

  const url = siteUrl(`/blog/${post.slug}`)
  const serpTitle = blogSerpTitle(post)
  const headline = blogHeadline(post)

  return {
    title: serpTitle,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: headline,
      description: post.description,
      url,
      siteName: 'MyCVRoast',
      type: 'article',
      publishedTime: post.date,
      locale: 'en_IN',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: headline,
      description: post.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const category = blogCategoryForSlug(post.slug)
  const typeLabel =
    post.type === 'comparison' ? 'Comparison' : post.type === 'tool' ? 'Product Guide' : 'Career Guide'
  const modifiedIso = getPostLastModified(post.slug, post.date).toISOString()
  const headline = blogHeadline(post)

  return (
    <div className="min-h-screen flex flex-col bg-bg-beige">
      <BlogHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd(headline, post.date, post.slug, post.description, modifiedIso),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(headline, post.slug)) }}
      />
      {post.faq && post.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqPageJsonLd(post.faq.map((f) => ({ question: f.q, answer: f.a })))),
          }}
        />
      )}
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 w-full">
        <BlogBreadcrumb title={post.title} />
        <article>
          <BlogFeaturedBanner
            title={headline}
            slug={post.slug}
            showTitle
            label={`${typeLabel} · ${category}`}
          />
          <BlogArticleMeta post={post} />
          <h1 className="font-display text-3xl md:text-[2.35rem] text-text-dark mb-4 leading-tight tracking-tight">
            {headline}
          </h1>
          {post.description && (
            <p className="font-body text-base text-dim leading-relaxed mb-8 border-l-2 border-orange/50 pl-4">
              {post.description}
            </p>
          )}
          {isGscPriorityBlog(post.slug) && <BlogInlineCta slug={post.slug} />}
          <div
            className="blog-prose font-body text-[15px] text-dim leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
          <BlogInlineCta slug={post.slug} />
          {post.faq && post.faq.length > 0 && <BlogFaqSection faq={post.faq} />}
          <BlogRelatedStrip links={getRelatedPosts(post.slug)} />
        </article>
        <BlogCta slug={post.slug} />
      </main>
      <BlogFooter />
    </div>
  )
}
