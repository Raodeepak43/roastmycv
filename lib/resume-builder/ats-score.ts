import type { ResumeData } from './types'

const STRONG_VERBS = [
  'led', 'owned', 'drove', 'built', 'scaled',
  'reduced', 'increased', 'launched', 'managed', 'architected',
]

const AI_WORDS = [
  'leverage', 'utilize', 'synergy',
  'dynamic', 'passionate', 'results-driven', 'spearheaded',
]

export interface AtsResult {
  score: number
  label: string
  color: string
  missing: string[]
}

export function calculateATS(data: ResumeData): AtsResult {
  let score = 0
  const missing: string[] = []

  const allBullets = data.experience.flatMap((e) => e.bullets).join(' ')
  const summaryAndBullets = `${data.summary} ${allBullets}`.toLowerCase()

  if (data.summary.length > 80) {
    score += 15
  } else {
    missing.push('Add a professional summary (80+ characters)')
  }

  if (/\d+/.test(allBullets)) {
    score += 20
  } else {
    missing.push('Add numbers/metrics to experience bullets')
  }

  const skillCount = Object.values(data.skills)
    .join(',')
    .split(',')
    .filter((s) => s.trim()).length
  if (skillCount >= 5) {
    score += 10
  } else {
    missing.push(`Add more skills (${skillCount}/5 minimum)`)
  }

  if (STRONG_VERBS.some((v) => allBullets.toLowerCase().includes(v))) {
    score += 15
  } else {
    missing.push('Use strong action verbs (Led, Owned, Built, Scaled…)')
  }

  if (!AI_WORDS.some((w) => summaryAndBullets.includes(w))) {
    score += 10
  } else {
    missing.push('Remove AI buzzwords (leverage, synergy, passionate…)')
  }

  if (data.education.degree.length > 3) {
    score += 10
  } else {
    missing.push('Add education details')
  }

  if (data.achievements[0]?.length > 10) {
    score += 10
  } else {
    missing.push('Add achievements or awards')
  }

  const { email, phone, location } = data.personal
  if (email && phone && location) {
    score += 10
  } else {
    missing.push('Complete contact info (email, phone, location)')
  }

  const finalScore = Math.min(100, score)

  let color = '#e24b4a'
  if (finalScore >= 70) color = '#0ca30c'
  else if (finalScore >= 40) color = '#eda100'

  if (finalScore >= 90) {
    return { score: finalScore, label: 'Excellent — Will pass ATS', color, missing }
  }
  if (finalScore >= 75) {
    return { score: finalScore, label: 'Good — Likely to pass', color, missing }
  }
  if (finalScore >= 60) {
    return { score: finalScore, label: 'Average — Needs work', color, missing }
  }
  return { score: finalScore, label: 'Poor — Will be rejected', color, missing }
}
