'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronDown, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { ChatMessage, InterviewFeedbackItem, VoiceEndReport } from '@/components/dashboard/interview/types'
import { formatInterviewDisplay } from '@/lib/tools/dashboard/interview-speech'

type MockProps = {
  variant: 'mock'
  overallScore: number
  summary?: string
  topMistakes?: string[]
  improvementTips?: string[]
  feedback: InterviewFeedbackItem[]
  messages?: ChatMessage[]
  role?: string
  onRetry: () => void
}

type VoiceProps = {
  variant: 'voice'
  report: VoiceEndReport
  messages?: { question: string; transcript: string }[]
  role?: string
  onRetry: () => void
}

type Props = MockProps | VoiceProps

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, (score / 10) * 100)
  return (
    <div className="dash-interview-results__score-ring">
      <svg viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r="52" className="dash-interview-results__ring-bg" />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          className="dash-interview-results__ring-fill"
          initial={{ strokeDashoffset: 327 }}
          animate={{ strokeDashoffset: 327 - (327 * pct) / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="dash-interview-results__score-value">
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          {score}
        </motion.span>
        <span>/10</span>
      </div>
    </div>
  )
}

function MistakesList({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="dash-interview-results__section dash-interview-results__section--mistakes">
      <h3>
        <AlertTriangle className="size-4" aria-hidden />
        What went wrong
      </h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function TipsList({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="dash-interview-results__section dash-interview-results__section--tips">
      <h3>
        <Lightbulb className="size-4" aria-hidden />
        How to improve
      </h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ConversationBlock({ messages }: { messages: ChatMessage[] }) {
  const visible = messages.filter((m) => !m.content.includes('INTERVIEW_COMPLETE'))
  if (!visible.length) return null
  return (
    <details className="dash-interview-results__card dash-interview-results__transcript">
      <summary>
        <span className="dash-interview-results__q">
          <MessageSquare className="size-4 shrink-0" aria-hidden />
          Conversation transcript
        </span>
        <ChevronDown className="size-4 shrink-0" aria-hidden />
      </summary>
      <div className="dash-interview-results__card-body dash-interview-results__transcript-body">
        {visible.map((m, i) => (
          <div key={i} className={`dash-interview-results__transcript-msg dash-interview-results__transcript-msg--${m.role}`}>
            <span className="dash-interview-results__transcript-label">
              {m.role === 'assistant' ? 'Interviewer' : 'You'}
            </span>
            <p>{m.role === 'assistant' ? formatInterviewDisplay(m.content) : m.content}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

export function InterviewResultsDashboard(props: Props) {
  const score = props.variant === 'mock' ? props.overallScore : props.report.overall_score
  const summary = props.variant === 'mock' ? props.summary : undefined
  const role = props.role

  const mistakes =
    props.variant === 'mock'
      ? props.topMistakes?.length
        ? props.topMistakes
        : props.feedback.map((f) => f.weak).filter(Boolean).slice(0, 5)
      : []

  const tips =
    props.variant === 'mock'
      ? props.improvementTips ?? []
      : props.report.feedback.flatMap((f) => f.stronger_includes ?? [])

  return (
    <div className="dash-interview-results">
      <div className="dash-interview-results__hero">
        <ScoreRing score={score} />
        <div>
          <h2 className="dash-interview-results__title">Session complete</h2>
          {role && <p className="dash-interview-results__role">{role}</p>}
          <p className="dash-interview-results__subtitle">
            {props.variant === 'voice'
              ? `Overall ${score}/10 — review your delivery patterns and per-answer feedback below.`
              : summary ?? 'Review your answers and improve for the real interview.'}
          </p>
        </div>
      </div>

      <div className="dash-interview-results__insights">
        <MistakesList items={mistakes.slice(0, 6)} />
        <TipsList items={tips.slice(0, 6)} />
      </div>

      {props.variant === 'voice' && (
        <div className="dash-voice-speech-report">
          <h3 className="dash-voice-speech-report__title">Speech pattern report</h3>
          <div className="dash-voice-speech-report__grid">
            <div className="dash-voice-speech-metric">
              <span className="dash-voice-speech-metric__value">{props.report.speech_report.total_fillers}</span>
              <span className="dash-voice-speech-metric__label">Filler words</span>
              <span className="dash-voice-speech-metric__hint">um, uh, like…</span>
            </div>
            <div className="dash-voice-speech-metric">
              <span className="dash-voice-speech-metric__value">{props.report.speech_report.avg_words}</span>
              <span className="dash-voice-speech-metric__label">Avg. words / answer</span>
              <span className="dash-voice-speech-metric__hint">Target 80–150 for STAR</span>
            </div>
            <div className="dash-voice-speech-metric dash-voice-speech-metric--wide">
              <span className="dash-voice-speech-metric__label">Longest answer</span>
              <p className="dash-voice-speech-metric__quote">{props.report.speech_report.longest_answer}</p>
            </div>
            <div className="dash-voice-speech-metric dash-voice-speech-metric--wide">
              <span className="dash-voice-speech-metric__label">Shortest answer</span>
              <p className="dash-voice-speech-metric__quote">{props.report.speech_report.shortest_answer}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dash-interview-results__list">
        {props.variant === 'mock'
          ? props.feedback.map((f, i) => (
              <motion.details
                key={i}
                className="dash-interview-results__card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                open={i === 0}
              >
                <summary>
                  <span className="dash-interview-results__q">{f.question}</span>
                  <ChevronDown className="size-4 shrink-0" aria-hidden />
                </summary>
                <div className="dash-interview-results__card-body">
                  <p className="dash-interview-results__summary italic">Your answer: {f.answer_summary}</p>
                  <p className="dash-interview-results__good">
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                    {f.good}
                  </p>
                  <p className="dash-interview-results__weak">
                    <XCircle className="size-4 shrink-0" aria-hidden />
                    <span>
                      <strong>Mistake / gap:</strong> {f.weak}
                    </span>
                  </p>
                  <div className="dash-interview-results__ideal">
                    <strong>Suggested improvement</strong>
                    <p>{f.ideal}</p>
                  </div>
                </div>
              </motion.details>
            ))
          : props.report.feedback.map((f, i) => (
              <motion.details
                key={i}
                className="dash-interview-results__card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                open={i === 0}
              >
                <summary>
                  <span className="dash-interview-results__q">{f.question}</span>
                  <ChevronDown className="size-4 shrink-0" aria-hidden />
                </summary>
                <div className="dash-interview-results__card-body">
                  <p className="dash-interview-results__summary italic">&ldquo;{f.transcript}&rdquo;</p>
                  <p className="dash-interview-results__good">
                    Score: {f.content_score}/10 — {f.content_feedback}
                  </p>
                  {f.delivery_note && <p>{f.delivery_note}</p>}
                  {f.stronger_includes?.length > 0 && (
                    <ul>
                      {f.stronger_includes.map((s, j) => (
                        <li key={j}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.details>
            ))}
      </div>

      {props.variant === 'mock' && props.messages && props.messages.length > 0 && (
        <ConversationBlock messages={props.messages} />
      )}

      <div className="dash-interview-results__actions">
        <button type="button" className="dash-tools-btn" onClick={props.onRetry}>
          Try again
        </button>
        {props.variant === 'voice' ? (
          <Link href="/dashboard/tools/mock-interview" className="dash-tools-btn--ghost dash-tools-btn">
            Switch to text mode
          </Link>
        ) : (
          <Link href="/dashboard" className="dash-tools-btn--ghost dash-tools-btn">
            Back to dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
