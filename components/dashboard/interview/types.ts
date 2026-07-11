export type InterviewFeedbackItem = {
  question: string
  answer_summary: string
  good: string
  weak: string
  ideal: string
}

export type MockInterviewComplete = {
  overall_score: number
  summary?: string
  top_mistakes?: string[]
  improvement_tips?: string[]
  feedback: InterviewFeedbackItem[]
}

export type VoiceEndReport = {
  overall_score: number
  speech_report: {
    total_fillers: number
    avg_words: number
    longest_answer: string
    shortest_answer: string
  }
  feedback: {
    question: string
    transcript: string
    content_score: number
    content_feedback: string
    delivery_note: string
    stronger_includes: string[]
  }[]
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
