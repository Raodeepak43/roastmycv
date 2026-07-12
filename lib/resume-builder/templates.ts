export type ResumeTemplateId =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'professional'
  | 'executive'
  | 'sidebar'
  | 'fresher'
  | 'harvard'
  | 'bold'
  | 'compact'
  | 'elegant'
  | 'timeline'

export type ResumeTemplateCategory = 'all' | 'ats' | 'corporate' | 'tech' | 'fresher' | 'modern'

export type ResumeTemplateLayout = 'standard' | 'sidebar' | 'header-band' | 'fresher' | 'compact'

export interface ResumeTemplateMeta {
  id: ResumeTemplateId
  name: string
  description: string
  tags: string[]
  category: Exclude<ResumeTemplateCategory, 'all'>
  layout: ResumeTemplateLayout
  /** All templates are free / ATS-safe */
  free: true
  sortOrder: number
}

export const TEMPLATE_CATEGORIES: { id: ResumeTemplateCategory; label: string }[] = [
  { id: 'all', label: 'All templates' },
  { id: 'ats', label: 'ATS-safe' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'tech', label: 'Tech' },
  { id: 'fresher', label: 'Fresher' },
  { id: 'modern', label: 'Modern' },
]

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: 'classic',
    name: 'Classic ATS',
    description: 'Clean single column with orange accent — works for every industry.',
    tags: ['ATS-safe', 'Single column'],
    category: 'ats',
    layout: 'standard',
    free: true,
    sortOrder: 1,
  },
  {
    id: 'modern',
    name: 'Modern Tech',
    description: 'Centered header with blue accents — popular for software roles.',
    tags: ['ATS-safe', 'Tech'],
    category: 'tech',
    layout: 'standard',
    free: true,
    sortOrder: 2,
  },
  {
    id: 'professional',
    name: 'Corporate Pro',
    description: 'Navy structured sections — banking, consulting, and ops roles.',
    tags: ['ATS-safe', 'Corporate'],
    category: 'corporate',
    layout: 'standard',
    free: true,
    sortOrder: 3,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Dark sidebar with contact and skills — senior and leadership profiles.',
    tags: ['ATS-safe', 'Sidebar'],
    category: 'corporate',
    layout: 'sidebar',
    free: true,
    sortOrder: 4,
  },
  {
    id: 'sidebar',
    name: 'Sidebar Pro',
    description: 'Two-column layout like Zety/Canva pro templates — still ATS-parseable.',
    tags: ['ATS-safe', 'Two column'],
    category: 'modern',
    layout: 'sidebar',
    free: true,
    sortOrder: 5,
  },
  {
    id: 'fresher',
    name: 'Campus Fresher',
    description: 'Education-first layout for students and 0–2 year candidates.',
    tags: ['ATS-safe', 'Fresher'],
    category: 'fresher',
    layout: 'fresher',
    free: true,
    sortOrder: 6,
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Black & white, maximum readability for conservative industries.',
    tags: ['ATS-safe', 'Finance'],
    category: 'ats',
    layout: 'standard',
    free: true,
    sortOrder: 7,
  },
  {
    id: 'harvard',
    name: 'Harvard Classic',
    description: 'Traditional academic style with elegant dividers and serif feel.',
    tags: ['ATS-safe', 'Academic'],
    category: 'corporate',
    layout: 'standard',
    free: true,
    sortOrder: 8,
  },
  {
    id: 'bold',
    name: 'Bold Impact',
    description: 'Full-width colored header band — stands out in creative + product roles.',
    tags: ['ATS-safe', 'Creative'],
    category: 'modern',
    layout: 'header-band',
    free: true,
    sortOrder: 9,
  },
  {
    id: 'compact',
    name: 'Compact One-Page',
    description: 'Dense spacing to fit more experience on a single A4 page.',
    tags: ['ATS-safe', 'One page'],
    category: 'ats',
    layout: 'compact',
    free: true,
    sortOrder: 10,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined typography with subtle gold accents — premium feel.',
    tags: ['ATS-safe', 'Premium'],
    category: 'modern',
    layout: 'standard',
    free: true,
    sortOrder: 11,
  },
  {
    id: 'timeline',
    name: 'Timeline Pro',
    description: 'Experience with timeline markers — clear career progression.',
    tags: ['ATS-safe', 'Experience'],
    category: 'tech',
    layout: 'standard',
    free: true,
    sortOrder: 12,
  },
]

export const DEFAULT_TEMPLATE_ID: ResumeTemplateId = 'classic'

const TEMPLATE_IDS = new Set<string>(RESUME_TEMPLATES.map((t) => t.id))

export function resolveTemplateId(id: string | undefined): ResumeTemplateId {
  if (id && TEMPLATE_IDS.has(id)) {
    return id as ResumeTemplateId
  }
  return DEFAULT_TEMPLATE_ID
}

export function getTemplateMeta(id: ResumeTemplateId): ResumeTemplateMeta {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0]
}

export function getTemplateLayout(id: ResumeTemplateId): ResumeTemplateLayout {
  return getTemplateMeta(id).layout
}

export function filterTemplatesByCategory(category: ResumeTemplateCategory): ResumeTemplateMeta[] {
  const sorted = [...RESUME_TEMPLATES].sort((a, b) => a.sortOrder - b.sortOrder)
  if (category === 'all') return sorted
  if (category === 'ats') return sorted
  return sorted.filter((t) => t.category === category)
}
