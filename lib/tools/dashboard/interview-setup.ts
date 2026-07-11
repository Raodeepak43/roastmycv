export const INTERVIEW_STYLES = [
  { id: 'friendly', label: 'Friendly HR' },
  { id: 'technical', label: 'Technical panel' },
  { id: 'faang', label: 'Tough FAANG-style' },
] as const

export const INTERVIEW_DURATIONS = [
  { id: 'short', label: '5 questions', count: 5 },
  { id: 'medium', label: '10 questions', count: 10 },
  { id: 'full', label: 'Full round (15)', count: 15 },
] as const

export type InterviewStyleId = (typeof INTERVIEW_STYLES)[number]['id']
export type InterviewDurationId = (typeof INTERVIEW_DURATIONS)[number]['id']

export function interviewQuestionCount(durationId: string): number {
  return INTERVIEW_DURATIONS.find((d) => d.id === durationId)?.count ?? 10
}

export function interviewStyleLabel(styleId: string): string {
  return INTERVIEW_STYLES.find((s) => s.id === styleId)?.label ?? styleId
}
