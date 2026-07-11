'use client'

import { AlertCircle, Clock, Loader2, Mic, MessageSquare, Sparkles, Square, Volume2 } from 'lucide-react'
import { formatInterviewDisplay } from '@/lib/tools/dashboard/interview-speech'

type Feedback = {
  content_score?: number
  content_feedback?: string
  delivery_note?: string
  stronger_includes?: string[]
}

type Props = {
  question: string
  transcript: string
  recording: boolean
  streaming: boolean
  wordCount: number
  fillerCount: number
  elapsed: number
  lastFeedback: Feedback | null
  hearPrompt?: boolean
  voiceLoading?: boolean
  yourTurn?: boolean
  interviewerBusy?: boolean
  speechSupported?: boolean
  onHearQuestion?: () => void
  onStartRecord: () => void
  onStopRecord: () => void
  onSubmit: () => void
}

function formatElapsed(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function InterviewVoiceStage({
  question,
  transcript,
  recording,
  streaming,
  wordCount,
  fillerCount,
  elapsed,
  lastFeedback,
  hearPrompt,
  voiceLoading,
  yourTurn,
  interviewerBusy,
  speechSupported,
  onHearQuestion,
  onStartRecord,
  onStopRecord,
  onSubmit,
}: Props) {
  const canSubmit = Boolean(transcript.trim()) && !streaming && !interviewerBusy
  const fillerHigh = fillerCount >= 4
  const micDisabled = Boolean(interviewerBusy || streaming)
  const showQuestion = Boolean(question)
  const listenHint = recording
    ? 'Listening… pause when done or stay silent to auto-submit'
    : yourTurn
      ? 'Your turn — tap the mic or start speaking'
      : voiceLoading
        ? 'Interviewer is speaking…'
        : streaming
          ? 'Preparing next question…'
          : 'Wait for the interviewer to finish'

  return (
    <div className="dash-voice-stage">
      <div className="dash-voice-stage__main">
        <section className="dash-voice-stage__question">
          <div className="dash-voice-stage__question-head">
            <span className="dash-voice-stage__eyebrow">Current question</span>
            {voiceLoading && (
              <span className="dash-voice-stage__processing">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Loading voice…
              </span>
            )}
            {streaming && !voiceLoading && (
              <span className="dash-voice-stage__processing">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Thinking…
              </span>
            )}
            {yourTurn && recording && (
              <span className="dash-voice-stage__live-badge">Your turn</span>
            )}
          </div>
          <p
            className={`dash-voice-stage__question-text${!showQuestion ? ' dash-voice-stage__question-text--loading' : ''}`}
          >
            {showQuestion
              ? formatInterviewDisplay(question)
              : voiceLoading
                ? 'Listen — question plays with AI voice…'
                : streaming
                  ? 'Preparing your next question…'
                  : 'Waiting for interviewer…'}
          </p>
        </section>

        {hearPrompt && onHearQuestion && (
          <button type="button" className="dash-voice-stage__hear-btn" onClick={onHearQuestion}>
            <Volume2 className="size-5" aria-hidden />
            Tap to hear question
          </button>
        )}

        {lastFeedback && (
          <section className="dash-voice-stage__feedback" aria-live="polite">
            <div className="dash-voice-stage__feedback-head">
              <Sparkles className="size-4 shrink-0" aria-hidden />
              <span>
                Previous answer · <strong>{lastFeedback.content_score}/10</strong>
              </span>
            </div>
            <p className="dash-voice-stage__feedback-body">{lastFeedback.content_feedback}</p>
            {lastFeedback.delivery_note && (
              <p className="dash-voice-stage__feedback-delivery">{lastFeedback.delivery_note}</p>
            )}
            {lastFeedback.stronger_includes && lastFeedback.stronger_includes.length > 0 && (
              <ul className="dash-voice-stage__feedback-list">
                {lastFeedback.stronger_includes.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="dash-voice-stage__capture">
          <div
            className={`dash-voice-stage__mic-zone${recording ? ' dash-voice-stage__mic-zone--active' : ''}${micDisabled ? ' dash-voice-stage__mic-zone--disabled' : ''}`}
          >
            <button
              type="button"
              className={`dash-voice-stage__mic-btn${recording ? ' dash-voice-stage__mic-btn--recording' : ''}`}
              disabled={micDisabled}
              onClick={recording ? onStopRecord : onStartRecord}
              aria-label={recording ? 'Pause recording' : 'Start recording'}
            >
              {recording ? <Square className="size-7" aria-hidden /> : <Mic className="size-8" aria-hidden />}
            </button>
            {recording && (
              <>
                <span className="dash-voice-stage__pulse dash-voice-stage__pulse--1" aria-hidden />
                <span className="dash-voice-stage__pulse dash-voice-stage__pulse--2" aria-hidden />
              </>
            )}
          </div>
          <p className="dash-voice-stage__mic-hint">{listenHint}</p>
          {!speechSupported && yourTurn && (
            <p className="dash-voice-stage__warn">Speech recognition unavailable — use Chrome or Edge.</p>
          )}

          <div className={`dash-voice-stage__transcript${recording ? ' dash-voice-stage__transcript--live' : ''}`}>
            <p className="dash-voice-stage__transcript-label">Live transcription</p>
            <p className="dash-voice-stage__transcript-text">
              {transcript ||
                (recording
                  ? 'Listening… speak clearly into your microphone'
                  : yourTurn
                    ? 'Start speaking — your words appear here live'
                    : 'Your answer will appear here when you speak')}
            </p>
          </div>

          <div className="dash-voice-stage__stats">
            <div className="dash-voice-stage__stat">
              <Clock className="size-3.5" aria-hidden />
              <span>{formatElapsed(elapsed)}</span>
            </div>
            <div className="dash-voice-stage__stat">
              <MessageSquare className="size-3.5" aria-hidden />
              <span>{wordCount} words</span>
            </div>
            <div className={`dash-voice-stage__stat${fillerHigh ? ' dash-voice-stage__stat--warn' : ''}`}>
              <AlertCircle className="size-3.5" aria-hidden />
              <span>
                {fillerCount} filler{fillerCount === 1 ? '' : 's'}
                {fillerHigh ? ' · slow down' : ''}
              </span>
            </div>
          </div>
        </section>
      </div>

      <footer className="dash-voice-stage__footer">
        <button
          type="button"
          className="dash-tools-btn--ghost dash-tools-btn"
          disabled={!recording || streaming}
          onClick={onStopRecord}
        >
          Pause
        </button>
        <button
          type="button"
          className="dash-tools-btn dash-voice-stage__submit"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {streaming ? 'Submitting…' : 'Submit answer'}
        </button>
      </footer>
    </div>
  )
}
