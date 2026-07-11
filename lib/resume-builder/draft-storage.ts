import type { ResumeData } from '@/lib/resume-builder/types'
import { resolveTemplateId } from '@/lib/resume-builder/templates'

const DRAFT_VERSION = 3

export function resumeDraftStorageKey(scope: 'public' | string): string {
  return scope === 'public' ? 'mcr_rb_draft_public' : `mcr_rb_draft_${scope}`
}

export type ResumeDraftPayload = {
  v: number
  data: ResumeData
  wizardStep?: number
  savedAt: number
}

export function loadResumeDraft(key: string): ResumeData | null {
  const payload = loadResumeDraftPayload(key)
  return payload?.data ?? null
}

export function loadResumeDraftPayload(key: string): ResumeDraftPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ResumeDraftPayload
    if (!parsed.data) return null
    if (parsed.v !== DRAFT_VERSION && parsed.v !== 2 && parsed.v !== 1) return null
    const data = parsed.data as ResumeData
    return {
      v: parsed.v,
      data: { ...data, templateId: resolveTemplateId(data.templateId) },
      wizardStep: typeof parsed.wizardStep === 'number' ? parsed.wizardStep : 0,
      savedAt: parsed.savedAt ?? Date.now(),
    }
  } catch {
    return null
  }
}

export function saveResumeDraft(key: string, data: ResumeData, wizardStep?: number): void {
  localStorage.setItem(
    key,
    JSON.stringify({
      v: DRAFT_VERSION,
      data,
      wizardStep: wizardStep ?? 0,
      savedAt: Date.now(),
    } satisfies ResumeDraftPayload),
  )
}
