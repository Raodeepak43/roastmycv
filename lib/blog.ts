import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface FaqItem {
  q: string
  a: string
}

export interface PostMeta {
  title: string
  /** Shorter SERP title (<60 chars) — used in meta title when set */
  metaTitle?: string
  /** Visible H1 — defaults to title when omitted */
  h1?: string
  slug: string
  date: string
  description: string
  keywords?: string
  faq?: FaqItem[]
  author?: string
  type?: 'guide' | 'comparison' | 'tool'
  readingMinutes?: number
}

export interface Post extends PostMeta {
  contentHtml: string
  rawContent: string
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export function isToolPost(slug: string): boolean {
  return (
    slug.endsWith('-tool') ||
    slug.includes('-analyser') ||
    slug === 'mycvroast-ai-tools-guide' ||
    (slug.endsWith('-generator') && slug.includes('letter'))
  )
}

function inferPostType(slug: string, explicit?: string): PostMeta['type'] {
  if (explicit === 'guide' || explicit === 'comparison' || explicit === 'tool') return explicit
  if (isToolPost(slug)) return 'tool'
  if (slug.includes('compared') || slug.includes('-vs-') || slug.startsWith('best-')) return 'comparison'
  return 'guide'
}

async function markdownToHtml(content: string): Promise<string> {
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content)
  return processed.toString()
}

export function formatBlogDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** File mtime for sitemap lastmod and Article schema dateModified. */
export function getPostLastModified(slug: string, fallbackDate: string): Date {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (fs.existsSync(filePath)) {
    return fs.statSync(filePath).mtime
  }
  const parsed = new Date(fallbackDate)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
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

function parseFaq(raw: unknown): FaqItem[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const items = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const q = String(row.q ?? row.question ?? '').trim()
      const a = String(row.a ?? row.answer ?? '').trim()
      if (!q || !a) return null
      return { q, a }
    })
    .filter((x): x is FaqItem => x !== null)
  return items.length ? items : undefined
}

export function getAllPosts(): PostMeta[] {
  return getBlogSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), 'utf-8')
      const { data, content } = matter(raw)
      return {
        title: String(data.title ?? slug),
        metaTitle: data.metaTitle ? String(data.metaTitle) : undefined,
        h1: data.h1 ? String(data.h1) : undefined,
        slug: String(data.slug ?? slug),
        date: String(data.date ?? ''),
        description: String(data.description ?? ''),
        keywords: data.keywords ? String(data.keywords) : undefined,
        faq: parseFaq(data.faq),
        author: data.author ? String(data.author) : 'MyCVRoast Team',
        type: inferPostType(slug, data.type ? String(data.type) : undefined),
        readingMinutes: estimateReadingMinutes(content),
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

  return {
    title: String(data.title ?? slug),
    metaTitle: data.metaTitle ? String(data.metaTitle) : undefined,
    h1: data.h1 ? String(data.h1) : undefined,
    slug: String(data.slug ?? slug),
    date: String(data.date ?? ''),
    description: String(data.description ?? ''),
    keywords: data.keywords ? String(data.keywords) : undefined,
    faq: parseFaq(data.faq),
    author: data.author ? String(data.author) : 'MyCVRoast Team',
    type: inferPostType(slug, data.type ? String(data.type) : undefined),
    readingMinutes: estimateReadingMinutes(content),
    contentHtml,
    rawContent: content,
  }
}
