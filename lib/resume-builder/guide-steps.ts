export const GUIDE_STEP_IDS = [
  'welcome',
  'personal',
  'summary',
  'experience',
  'skills',
  'education',
  'preview',
  'download',
] as const

export type GuideStepId = (typeof GUIDE_STEP_IDS)[number]

export function guideAnchorFor(stepId: GuideStepId): string | null {
  const map: Record<GuideStepId, string | null> = {
    welcome: null,
    personal: 'rb-section-personal',
    summary: 'rb-section-summary',
    experience: 'rb-section-experience',
    skills: 'rb-section-skills',
    education: 'rb-section-education',
    preview: 'rb-preview-pane',
    download: 'rb-download-btn',
  }
  return map[stepId]
}

export function scrollToGuideTarget(stepId: GuideStepId) {
  const anchor = guideAnchorFor(stepId)
  if (!anchor) return
  requestAnimationFrame(() => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
