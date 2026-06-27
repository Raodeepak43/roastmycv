import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SITE = 'https://mycvroast.in'
const blogDir = path.join(process.cwd(), 'content/blog')

export default function sitemap(): MetadataRoute.Sitemap {
  let blogPosts: MetadataRoute.Sitemap = []

  try {
    const files = fs.readdirSync(blogDir)
    blogPosts = files
      .filter((f) => f.endsWith('.md'))
      .map((file) => {
        const slug = file.replace('.md', '')
        let lastModified = new Date()
        try {
          const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
          const { data } = matter(raw)
          if (data.date) lastModified = new Date(String(data.date))
        } catch { /* use today */ }
        return {
          url: `${SITE}/blog/${slug}`,
          lastModified,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }
      })
  } catch { /* no blog dir yet */ }

  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE}/resume-builder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...blogPosts,
  ]
}
