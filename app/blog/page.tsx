import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, formatBlogDate } from '@/lib/blog'
import { BlogFooter, BlogHeader } from '@/components/BlogChrome'
import { BlogFeaturedBanner } from '@/components/BlogFeaturedBanner'

export const metadata: Metadata = {
  title: 'MyCVRoast Blog — Resume Tips & Career Advice',
  description: 'Resume roast guides, ATS tips, fresher formats, and free resume checker advice for Indian job seekers. Brutally honest career advice from MyCVRoast.',
  alternates: { canonical: 'https://mycvroast.in/blog' },
  openGraph: {
    title: 'MyCVRoast Blog — Resume Tips & Career Advice',
    description: 'Resume roast guides, ATS tips, and career advice for job seekers in India and worldwide.',
    url: 'https://mycvroast.in/blog',
    siteName: 'MyCVRoast',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <BlogHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 w-full">
        <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
          MyCVRoast Blog — Resume Tips &amp; Career Advice
        </h1>
        <p className="font-body text-sm text-muted mb-10">
          Honest resume advice, ATS guides, and career tips. No fluff — just what actually gets you hired.
        </p>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-ui block p-5 md:p-6 hover:border-orange transition-colors"
            >
              <BlogFeaturedBanner title={post.title} slug={post.slug} compact />
              <time className="font-body text-[11px] text-muted uppercase tracking-wider">{formatBlogDate(post.date)}</time>
              <h2 className="font-display text-lg md:text-xl text-white mt-1 mb-2">{post.title}</h2>
              <p className="font-body text-[13px] text-[#888888] leading-relaxed">{post.description}</p>
              <span className="font-body text-[12px] text-orange mt-3 inline-block">Read more →</span>
            </Link>
          ))}
        </div>
      </main>
      <BlogFooter />
    </div>
  )
}
