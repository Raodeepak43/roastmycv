import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface PostMeta {
  title: string
  slug: string
  date: string
  description: string
  keywords?: string
}

export interface Post extends PostMeta {
  contentHtml: string
}

export function formatBlogDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function blogDirExists() {
  return fs.existsSync(BLOG_DIR)
}

export function getBlogSlugs(): string[] {
  if (!blogDirExists()) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export function getAllPosts(): PostMeta[] {
  return getBlogSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), 'utf-8')
      const { data } = matter(raw)
      return {
        title: String(data.title ?? slug),
        slug: String(data.slug ?? slug),
        date: String(data.date ?? ''),
        description: String(data.description ?? ''),
        keywords: data.keywords ? String(data.keywords) : undefined,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const processed = await remark().use(remarkHtml).process(content)

  return {
    title: String(data.title ?? slug),
    slug: String(data.slug ?? slug),
    date: String(data.date ?? ''),
    description: String(data.description ?? ''),
    keywords: data.keywords ? String(data.keywords) : undefined,
    contentHtml: processed.toString(),
  }
}
