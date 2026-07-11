import { getAllPosts } from '@/lib/blog'
import { siteUrl } from '@/lib/seo'

export const dynamic = 'force-static'
export const revalidate = 3600

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const posts = getAllPosts()
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl(`/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${siteUrl(`/blog/${post.slug}`)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`,
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MyCVRoast Blog — Resume Tips &amp; Career Advice</title>
    <link>${siteUrl('/blog')}</link>
    <description>Resume roast guides, ATS tips, and career advice for job seekers in India and worldwide.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl('/blog/rss.xml')}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
