'use client'

import { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'
import { formatInterviewDisplay } from '@/lib/tools/dashboard/interview-speech'
import { InterviewTypingDots } from '@/components/dashboard/tools/InterviewAnswerInput'
import type { ChatMessage } from '@/components/dashboard/interview/types'

type Props = {
  messages: ChatMessage[]
  streaming?: boolean
  waiting?: boolean
  loadingAudio?: boolean
}

export function InterviewTranscript({ messages, streaming, waiting, loadingAudio }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
  }, [messages, streaming, waiting, loadingAudio])

  const visible = messages.filter((m) => !m.content.includes('INTERVIEW_COMPLETE'))

  return (
    <div className="dash-interview-room__transcript" ref={ref}>
      {visible.length === 0 && !streaming && !waiting && !loadingAudio && (
        <div className="dash-interview-room__empty">
          <p>Your interview will appear here. Listen to the question, then type or speak your answer below.</p>
        </div>
      )}
      {visible.map((m, i) => {
        const isAi = m.role === 'assistant'
        return (
          <div
            key={i}
            className={`dash-interview-room__msg ${isAi ? 'dash-interview-room__msg--ai' : 'dash-interview-room__msg--user'}`}
          >
            <div className="dash-interview-room__msg-row">
              <span className="dash-interview-room__msg-icon" aria-hidden>
                {isAi ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
              </span>
              <div className="dash-interview-room__msg-content">
                <span className="dash-interview-room__msg-label">{isAi ? 'Interviewer' : 'You'}</span>
                <div className="dash-interview-room__msg-body">
                  {isAi ? formatInterviewDisplay(m.content) : m.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      {(streaming || waiting || loadingAudio) && (
        <div className="dash-interview-room__msg dash-interview-room__msg--ai dash-interview-room__msg--typing">
          <div className="dash-interview-room__msg-row">
            <span className="dash-interview-room__msg-icon" aria-hidden>
              <Bot className="size-3.5" />
            </span>
            <div className="dash-interview-room__msg-content">
              <span className="dash-interview-room__msg-label">Interviewer</span>
              <div className="dash-interview-room__msg-body">
                <InterviewTypingDots />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
