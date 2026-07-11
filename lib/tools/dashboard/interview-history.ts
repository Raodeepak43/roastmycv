import type { ChatMessage, InterviewFeedbackItem, VoiceEndReport } from '@/components/dashboard/interview/types'

export type MockInterviewResultData = {
  overallScore: number
  summary?: string
  top_mistakes?: string[]
  improvement_tips?: string[]
  feedback: InterviewFeedbackItem[]
  messages: ChatMessage[]
  role: string
  style: string
  duration: string
}

export type VoiceInterviewResultData = {
  report: VoiceEndReport
  turns: { question: string; transcript: string }[]
  role: string
  style: string
  duration: string
}

export function buildMockInterviewMarkdown(data: MockInterviewResultData): string {
  const parts: string[] = [
    `## Mock Interview — ${data.role}`,
    '',
    `**Score:** ${data.overallScore}/10`,
  ]

  if (data.summary?.trim()) {
    parts.push('', '## Summary', '', data.summary.trim())
  }

  if (data.top_mistakes?.length) {
    parts.push('', '## What went wrong', '', ...data.top_mistakes.map((m) => `- ${m}`))
  }

  if (data.improvement_tips?.length) {
    parts.push('', '## How to improve', '', ...data.improvement_tips.map((t) => `- ${t}`))
  }

  if (data.feedback.length) {
    parts.push('', '## Question breakdown')
    data.feedback.forEach((f, i) => {
      parts.push(
        '',
        `### Q${i + 1}. ${f.question}`,
        '',
        `**Your answer:** ${f.answer_summary}`,
        '',
        `**Good:** ${f.good}`,
        '',
        `**Mistake / gap:** ${f.weak}`,
        '',
        `**Better approach:** ${f.ideal}`,
      )
    })
  }

  if (data.messages.length) {
    parts.push('', '## Conversation')
    data.messages
      .filter((m) => !m.content.includes('INTERVIEW_COMPLETE'))
      .forEach((m) => {
        const label = m.role === 'assistant' ? 'Interviewer' : 'You'
        parts.push('', `**${label}:** ${m.content.slice(0, 2000)}`)
      })
  }

  return parts.join('\n')
}

export function buildVoiceInterviewMarkdown(data: VoiceInterviewResultData): string {
  const { report } = data
  const parts: string[] = [
    `## Voice Interview — ${data.role}`,
    '',
    `**Score:** ${report.overall_score}/10`,
    '',
    '## Speech pattern',
    '',
    `- Filler words: ${report.speech_report.total_fillers}`,
    `- Avg answer length: ${report.speech_report.avg_words} words`,
  ]

  report.feedback.forEach((f, i) => {
    parts.push(
      '',
      `### Q${i + 1}. ${f.question}`,
      '',
      `**Score:** ${f.content_score}/10 — ${f.content_feedback}`,
      '',
      `**Your answer:** "${f.transcript}"`,
    )
    if (f.delivery_note) parts.push('', f.delivery_note)
  })

  return parts.join('\n')
}

export async function saveInterviewResult(input: {
  slug: 'mock-interview' | 'voice-interview'
  title: string
  inputSummary: string
  resultText: string
  resultData: Record<string, unknown>
}): Promise<boolean> {
  try {
    const res = await fetch('/api/dashboard/tool-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: input.slug,
        title: input.title,
        inputSummary: input.inputSummary,
        resultText: input.resultText,
        resultData: input.resultData,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function loadInterviewResultData(id: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/dashboard/tool-results/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return (json.item?.result_data as Record<string, unknown>) ?? null
  } catch {
    return null
  }
}
