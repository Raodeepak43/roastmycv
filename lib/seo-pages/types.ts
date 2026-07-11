import type { IntensityKey } from '@/app/i18n'

export type SeoFaq = { question: string; answer: string }

export type SeoSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type ToolLandingConfig = {
  slug: string
  keyword: string
  h1: string
  title: string
  metaDescription: string
  keywordMeta: string
  cluster: string
  priority: string
  intro: string[]
  sections: SeoSection[]
  faq: SeoFaq[]
  relatedSlugs: string[]
  defaultLanguage: string
  defaultIntensity?: IntensityKey
}

export type RoleCheckerConfig = {
  slug: string
  role: string
  keyword: string
  h1: string
  title: string
  metaDescription: string
  keywordMeta: string
  intro: string[]
  sections: SeoSection[]
  atsKeywords: string[]
  commonMistakes: string[]
  faq: SeoFaq[]
  relatedSlugs: string[]
  defaultLanguage: string
  defaultIntensity?: IntensityKey
}

export type SkippedCollision = {
  keyword: string
  slug: string
  reason: 'reserved' | 'static-route' | 'blog-path' | 'tools-path'
  existingPath: string
}
