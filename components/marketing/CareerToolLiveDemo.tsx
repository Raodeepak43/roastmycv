'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, Lock, Mic, Volume2 } from 'lucide-react'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import {
  DEFAULT_INTERVIEW_VOICE_ID,
  INTERVIEW_VOICES,
  type InterviewVoiceId,
} from '@/lib/tools/dashboard/interview-voices'
import {
  CAREER_DEMO_STORAGE_PREFIX,
  getDemoSpeechLine,
  type DemoSpeechPurpose,
} from '@/lib/tools/marketing/demo-speech'
import type { CareerToolPreview } from '@/lib/tools/marketing/demo-previews'
import { formatProPrice } from '@/lib/plans'

type Props = {
  slug: ToolSlug
  preview: CareerToolPreview
  headline: string
  dashboardHref: string
  isProOnly: boolean
}

function loginHref(dashboardPath: string) {
  return `/login?next=${encodeURIComponent(dashboardPath)}`
}

function getDemoRuns(slug: string): number {
  if (typeof window === 'undefined') return 0
  try {
    return Number(sessionStorage.getItem(`${CAREER_DEMO_STORAGE_PREFIX}${slug}`) || '0')
  } catch {
    return 0
  }
}

function recordDemoRun(slug: string): number {
  const next = getDemoRuns(slug) + 1
  try {
    sessionStorage.setItem(`${CAREER_DEMO_STORAGE_PREFIX}${slug}`, String(next))
  } catch {
    /* ignore */
  }
  return next
}

function DemoGate({
  slug,
  dashboardHref,
  isProOnly,
  onClose,
}: {
  slug: ToolSlug
  dashboardHref: string
  isProOnly: boolean
  onClose?: () => void
}) {
  return (
    <div className="career-saas-live__gate">
      <Lock className="size-8 text-orange mb-3" aria-hidden />
      <p className="career-saas-live__gate-title">Free demo used for this tool</p>
      <p className="career-saas-live__gate-sub">
        Sign in to run {slug.replace(/-/g, ' ')} with <strong>your CV</strong> in the dashboard.
        {isProOnly ? ' This is a Pro tool — upgrade after sign-in.' : ' Free tier limits apply.'}
      </p>
      <ol className="career-saas-live__gate-steps">
        <li>Sign in free</li>
        <li>Open tool in dashboard</li>
        <li>{isProOnly ? `Get Pro (${formatProPrice()}) for unlimited` : 'Use your free credits'}</li>
      </ol>
      <div className="career-saas-live__gate-actions">
        <Link href={loginHref(dashboardHref)} className="btn-roast career-saas-hero__cta">
          Continue in dashboard
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        {isProOnly && (
          <Link href="/plans" className="career-saas-hero__cta-secondary">
            See Pro pricing
          </Link>
        )}
      </div>
      {onClose && (
        <button type="button" className="career-saas-live__gate-dismiss" onClick={onClose}>
          Back to demo
        </button>
      )}
    </div>
  )
}

async function fetchDemoAudio(slug: ToolSlug, purpose: DemoSpeechPurpose, voiceId: InterviewVoiceId) {
  const text = getDemoSpeechLine(slug, purpose)
  if (!text) return null

  const res = await fetch('/api/demo/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, slug, purpose }),
  })

  if (!res.ok || !res.headers.get('content-type')?.includes('audio')) {
    return null
  }

  return res.blob()
}

function InterviewLiveDemo({ slug, preview, dashboardHref, isProOnly }: Props) {
  const isVoice = preview.interview?.mode === 'voice'
  const [voiceId, setVoiceId] = useState<InterviewVoiceId>(DEFAULT_INTERVIEW_VOICE_ID)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [playingPurpose, setPlayingPurpose] = useState<DemoSpeechPurpose | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questionHeard, setQuestionHeard] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const hasSpeech = Boolean(getDemoSpeechLine(slug, 'question'))

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
      audioRef.current = null
    }
    setPlayingId(null)
    setPlayingPurpose(null)
    setLoading(false)
  }, [])

  useEffect(() => () => stopAudio(), [stopAudio])

  const playLine = useCallback(
    async (purpose: DemoSpeechPurpose, selectedVoice: InterviewVoiceId) => {
      if (!hasSpeech) return

      if (getDemoRuns(slug) >= 1 && purpose === 'question' && sessionStarted) {
        setShowGate(true)
        return
      }

      stopAudio()
      setError('')
      setLoading(true)
      setPlayingId(selectedVoice)
      setPlayingPurpose(purpose)

      try {
        const blob = await fetchDemoAudio(slug, purpose, selectedVoice)
        if (!blob) {
          setError('Voice demo unavailable — sign in to use full interview in dashboard.')
          stopAudio()
          return
        }

        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          URL.revokeObjectURL(url)
          audioRef.current = null
          setPlayingId(null)
          setPlayingPurpose(null)
          setLoading(false)
          if (purpose === 'question') {
            setQuestionHeard(true)
            if (!sessionStarted) {
              recordDemoRun(slug)
              setSessionStarted(true)
            }
          }
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          stopAudio()
          setError('Could not play audio.')
        }
        await audio.play()
        setLoading(false)
      } catch {
        stopAudio()
        setError('Could not play voice demo.')
      }
    },
    [hasSpeech, sessionStarted, slug, stopAudio],
  )

  const handleStartSession = () => {
    if (getDemoRuns(slug) >= 1) {
      setShowGate(true)
      return
    }
    void playLine('question', voiceId)
  }

  const handleTryAgain = () => {
    setShowGate(true)
  }

  if (showGate) {
    return <DemoGate slug={slug} dashboardHref={dashboardHref} isProOnly={isProOnly} />
  }

  const question = preview.interview?.question ?? getDemoSpeechLine(slug, 'question') ?? ''

  return (
    <div className="career-saas-live career-saas-live--interview">
      <p className="career-saas-live__hint">
        {INTERVIEW_VOICES.length} interviewer voices — same as dashboard. Preview a style, then hear a real question.
      </p>

      <div className="career-saas-live__voice-grid">
        {INTERVIEW_VOICES.map((v) => {
          const active = voiceId === v.id
          const playing = playingId === v.id
          return (
            <div key={v.id} className={`career-saas-live__voice-card${active ? ' career-saas-live__voice-card--active' : ''}`}>
              <button type="button" className="career-saas-live__voice-select" onClick={() => setVoiceId(v.id)}>
                <span className="career-saas-live__voice-name">{v.label}</span>
                <span className={`career-saas-live__voice-gender career-saas-live__voice-gender--${v.gender}`}>
                  {v.gender === 'female' ? 'Female' : 'Male'}
                </span>
                <span className="career-saas-live__voice-hint">{v.hint}</span>
              </button>
              <button
                type="button"
                className={`career-saas-live__voice-play${playing ? ' career-saas-live__voice-play--active' : ''}`}
                onClick={() => void playLine('greeting', v.id)}
                aria-label={`Preview ${v.label} voice`}
                title="Plays greeting line"
              >
                {playing && playingPurpose === 'greeting' ? <Loader2 className="size-3.5 animate-spin" /> : '▶'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="career-saas-live__question-panel">
        <div className="career-saas-live__question-head">
          <span>Interview question</span>
          {(loading || (playingId && playingPurpose === 'question')) && (
            <span className="career-saas-live__speaking">
              <span className="career-saas-live__voice-bars" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="career-saas-live__bar" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </span>
              AI voice speaking…
            </span>
          )}
        </div>
        <p className="career-saas-live__question-text">{question}</p>
        <button
          type="button"
          className="career-saas-live__hear-btn"
          onClick={() => void playLine('question', voiceId)}
          disabled={loading}
        >
          <Volume2 className="size-4" aria-hidden />
          Hear question with {INTERVIEW_VOICES.find((v) => v.id === voiceId)?.label}
        </button>
      </div>

      {isVoice && questionHeard && (
        <div className="career-saas-live__voice-stage">
          <div className="career-saas-live__transcript">
            <span>Your answer (demo)</span>
            <p className="career-saas-live__transcript-placeholder">
              In the dashboard you speak here — live transcript, filler count, and delivery score.
            </p>
          </div>
          <div className="career-saas-live__mic-row">
            <span className="career-saas-live__mic career-saas-live__mic--locked">
              <Mic className="size-4" aria-hidden />
              Mic — sign in to record
            </span>
            <span className="career-saas-live__mic-stats">Words · Fillers · Timer</span>
          </div>
        </div>
      )}

      {!questionHeard ? (
        <button type="button" className="career-saas-live__primary" onClick={handleStartSession}>
          Start live demo session
        </button>
      ) : (
        <div className="career-saas-live__post">
          <p className="career-saas-live__feedback">
            Demo feedback: <strong>8/10</strong> content — sign in for real scoring on your answers.
          </p>
          <button type="button" className="career-saas-live__primary" onClick={handleTryAgain}>
            Practice with my CV
          </button>
        </div>
      )}

      {error && <p className="career-saas-live__error">{error}</p>}
    </div>
  )
}

function GenerateLiveDemo({ slug, preview, dashboardHref, isProOnly }: Props) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'gate'>('idle')

  const runDemo = () => {
    if (getDemoRuns(slug) >= 1) {
      setPhase('gate')
      return
    }
    setPhase('running')
    recordDemoRun(slug)
    window.setTimeout(() => setPhase('done'), 1400)
  }

  const tryAgain = () => setPhase('gate')

  if (phase === 'gate') {
    return <DemoGate slug={slug} dashboardHref={dashboardHref} isProOnly={isProOnly} />
  }

  return (
    <div className="career-saas-live career-saas-live--generate">
      {preview.form && (
        <div className="career-saas-live__inputs">
          {preview.form.fields.map((f) => (
            <div key={f.label} className="career-saas-live__input">
              <label>{f.label}</label>
              <p>{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {preview.email && phase === 'idle' && (
        <div className="career-saas-live__inputs">
          <div className="career-saas-live__input">
            <label>To</label>
            <p>{preview.email.to}</p>
          </div>
          <div className="career-saas-live__input">
            <label>Subject</label>
            <p>{preview.email.subject}</p>
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div className="career-saas-live__running">
          <Loader2 className="size-6 animate-spin text-orange" aria-hidden />
          <p>Generating with AI — same engine as dashboard…</p>
        </div>
      )}

      {phase === 'done' && preview.email && (
        <div className="career-saas-live__output">
          <span>Generated output</span>
          <pre>{preview.email.body}</pre>
        </div>
      )}

      {phase === 'done' && preview.analysis && (
        <div className="career-saas-live__output career-saas-live__output--analysis">
          <div className="career-saas-live__analysis-score">
            {preview.analysis.score > 0 ? (
              <>
                <strong>{preview.analysis.score}%</strong>
                <small>{preview.analysis.scoreLabel}</small>
              </>
            ) : (
              <strong>{preview.analysis.scoreLabel}</strong>
            )}
          </div>
          <ul>
            {preview.analysis.items.map((item) => (
              <li key={item.text} className={`career-saas-live__item--${item.kind}`}>
                {item.text}
              </li>
            ))}
          </ul>
          {preview.analysis.footer && <p className="career-saas-live__footer">{preview.analysis.footer}</p>}
        </div>
      )}

      {phase === 'done' && preview.form && (
        <div className="career-saas-live__output">
          <span>{preview.form.outputTitle}</span>
          <pre>{preview.form.output}</pre>
        </div>
      )}

      {phase === 'idle' && (
        <button type="button" className="career-saas-live__primary" onClick={runDemo}>
          Run live demo
        </button>
      )}

      {phase === 'done' && (
        <div className="career-saas-live__post">
          <p className="career-saas-live__feedback">Demo used sample data — dashboard personalises from your CV.</p>
          <button type="button" className="career-saas-live__primary" onClick={tryAgain}>
            Run with my CV
          </button>
        </div>
      )}
    </div>
  )
}

export function CareerToolLiveDemo(props: Props) {
  const { preview, slug } = props
  const hasInterviewSpeech = Boolean(preview.interview && getDemoSpeechLine(slug, 'question'))
  const isInterview =
    preview.interview && (preview.interview.mode === 'voice' || preview.interview.mode === 'text') && hasInterviewSpeech

  if (isInterview) {
    return <InterviewLiveDemo {...props} />
  }

  if (preview.email || preview.analysis || preview.form) {
    return <GenerateLiveDemo {...props} />
  }

  return <GenerateLiveDemo {...props} />
}
