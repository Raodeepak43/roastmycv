export type ResumeTemplateId = 'classic' | 'modern' | 'minimal' | 'professional'

export interface ResumeTemplateMeta {
  id: ResumeTemplateId
  name: string
  description: string
  tags: string[]
  /** All templates are free / ATS-safe */
  free: true
}

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean single column with accent header rule — works everywhere.',
    tags: ['ATS-safe', 'Single column'],
    free: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Centered header, subtle dividers — great for tech roles.',
    tags: ['ATS-safe', 'Tech'],
    free: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Black & white, maximum readability for conservative industries.',
    tags: ['ATS-safe', 'Finance'],
    free: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Structured sections with navy accents — corporate-ready.',
    tags: ['ATS-safe', 'Corporate'],
    free: true,
  },
]

export const DEFAULT_TEMPLATE_ID: ResumeTemplateId = 'classic'

export function resolveTemplateId(id: string | undefined): ResumeTemplateId {
  if (id && RESUME_TEMPLATES.some((t) => t.id === id)) {
    return id as ResumeTemplateId
  }
  return DEFAULT_TEMPLATE_ID
}

export function getTemplateMeta(id: ResumeTemplateId): ResumeTemplateMeta {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0]
}
