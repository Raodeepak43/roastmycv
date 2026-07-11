import {
  defaultResumeData,
  type ResumeData,
  type ResumeEducation,
  type ResumeExperience,
  type ResumePersonal,
  type ResumeProject,
  type ResumeSkills,
  uid,
} from '@/lib/resume-builder/types'

function pickStrings(source: Record<string, unknown> | undefined): Record<string, string> {
  if (!source || typeof source !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string' && value.trim()) out[key] = value.trim()
  }
  return out
}

function normalizeExperience(raw: unknown): ResumeExperience[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const company = String(row.company ?? '').trim()
      const jobTitle = String(row.jobTitle ?? row.title ?? '').trim()
      const bulletsRaw = row.bullets
      const bullets = Array.isArray(bulletsRaw)
        ? bulletsRaw.map((b) => String(b).trim()).filter(Boolean)
        : []
      if (!company && !jobTitle && bullets.length === 0) return null
      return {
        id: uid(),
        company,
        jobTitle,
        location: String(row.location ?? '').trim(),
        startDate: String(row.startDate ?? row.start ?? '').trim(),
        endDate: String(row.endDate ?? row.end ?? 'Present').trim(),
        bullets: bullets.length > 0 ? bullets : [''],
      }
    })
    .filter((row): row is ResumeExperience => row !== null)
}

function normalizeProjects(raw: unknown): ResumeProject[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = String(row.name ?? row.title ?? '').trim()
      const description = String(row.description ?? '').trim()
      const techStack = String(row.techStack ?? row.tech ?? '').trim()
      if (!name && !description) return null
      return { id: uid(), name, techStack, description }
    })
    .filter((row): row is ResumeProject => row !== null)
}

function normalizeAchievements(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const items = raw.map((item) => String(item).trim()).filter(Boolean)
  return items.length > 0 ? items : []
}

export type ExtractedPrefillInput = {
  personal?: Partial<ResumePersonal>
  summary?: string
  experience?: ResumeExperience[]
  projects?: ResumeProject[]
  skills?: Partial<ResumeSkills>
  education?: Partial<ResumeEducation>
  achievements?: string[]
}

export function parseExtractedResume(raw: unknown): ExtractedPrefillInput {
  if (!raw || typeof raw !== 'object') return {}
  const data = raw as Record<string, unknown>
  const personal = pickStrings(data.personal as Record<string, unknown> | undefined) as Partial<ResumePersonal>
  const skills = pickStrings(data.skills as Record<string, unknown> | undefined) as Partial<ResumeSkills>
  const education = pickStrings(data.education as Record<string, unknown> | undefined) as Partial<ResumeEducation>
  const experience = normalizeExperience(data.experience)
  const projects = normalizeProjects(data.projects)
  const achievements = normalizeAchievements(data.achievements)
  const summary = typeof data.summary === 'string' ? data.summary.trim() : ''

  return {
    ...(Object.keys(personal).length ? { personal: personal as Partial<ResumePersonal> } : {}),
    ...(summary ? { summary } : {}),
    ...(experience.length ? { experience } : {}),
    ...(projects.length ? { projects } : {}),
    ...(Object.keys(skills).length ? { skills: skills as Partial<ResumeSkills> } : {}),
    ...(Object.keys(education).length ? { education: education as Partial<ResumeEducation> } : {}),
    ...(achievements.length ? { achievements } : {}),
  } as ExtractedPrefillInput
}

export function applyPrefill(extracted: ExtractedPrefillInput): ResumeData {
  const base = defaultResumeData()

  const personal = { ...base.personal, ...(extracted.personal ?? {}) }
  const skills = { ...base.skills, ...(extracted.skills ?? {}) }
  const education = { ...base.education, ...(extracted.education ?? {}) }

  return {
    personal,
    summary: extracted.summary?.trim() || base.summary,
    experience: extracted.experience?.length ? extracted.experience : base.experience,
    projects: extracted.projects?.length ? extracted.projects : base.projects,
    skills,
    education,
    achievements: extracted.achievements?.length ? extracted.achievements : base.achievements,
  }
}

/** Basic regex fallback when LLM is unavailable */
export function heuristicExtract(text: string): ResumeData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const email = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)?.[0] ?? ''
  const phone = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}|\(\d{3}\)\s?\d{3}-\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] ?? ''
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i)?.[0] ?? ''
  const firstLine = lines[0] ?? ''
  const fullName =
    firstLine.length > 2 && firstLine.length < 60 && !firstLine.includes('@') ? firstLine : ''

  const personal: Partial<ResumePersonal> = {}
  if (fullName) personal.fullName = fullName
  if (email) personal.email = email
  if (phone) personal.phone = phone
  if (linkedin) personal.linkedin = linkedin

  const summaryIdx = lines.findIndex((l) => /summary|objective|profile|about/i.test(l))
  let summary = ''
  if (summaryIdx >= 0) {
    summary = lines.slice(summaryIdx + 1, summaryIdx + 4).join(' ').slice(0, 500)
  }

  return applyPrefill({
    personal: Object.keys(personal).length ? (personal as Partial<ResumePersonal>) : undefined,
    summary: summary || undefined,
  })
}

export function countFilledFields(data: ResumeData): number {
  let n = 0
  if (data.personal.fullName) n++
  if (data.personal.email) n++
  if (data.personal.phone) n++
  if (data.personal.jobTitle) n++
  if (data.summary) n++
  if (data.experience.some((e) => e.company || e.jobTitle)) n++
  if (data.projects.some((p) => p.name)) n++
  if (data.skills.languages || data.skills.frameworks) n++
  if (data.education.degree || data.education.university) n++
  return n
}
