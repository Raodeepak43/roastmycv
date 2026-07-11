'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { InterviewResultsDashboard } from '@/components/dashboard/interview/InterviewResultsDashboard'
import { InterviewRoomShell } from '@/components/dashboard/interview/InterviewRoomShell'
import { InterviewSetupWizard } from '@/components/dashboard/interview/InterviewSetupWizard'
import { InterviewVoiceStage } from '@/components/dashboard/interview/InterviewVoiceStage'
import type { VoiceEndReport } from '@/components/dashboard/interview/types'
import { useInterviewSpeech } from '@/components/dashboard/tools/useInterviewSpeech'
import { useInterviewVoicePreference } from '@/components/dashboard/tools/InterviewVoicePicker'
import { useSpeechRecognition } from '@/components/dashboard/tools/useSpeechRecognition'
import { ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { streamToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'
import {
  buildVoiceInterviewMarkdown,
  loadInterviewResultData,
  saveInterviewResult,
  type VoiceInterviewResultData,
} from '@/lib/tools/dashboard/interview-history'
import { unlockInterviewAudio } from '@/lib/tools/dashboard/interview-speech'
import {
  interviewQuestionCount,
  type InterviewDurationId,
  type InterviewStyleId,
} from '@/lib/tools/dashboard/interview-setup'

const FILLERS = /\b(um+|uh+|like|you know|basically|actually)\b/gi

type AnswerFeedback = {
  content_score?: number
  content_feedback?: string
  delivery_note?: string
  stronger_includes?: string[]
  done?: boolean
}

type TurnRecord = {
  question: string
  transcript: string
  wordCount: number
  fillerCount: number
  durationSec: number
  feedback?: AnswerFeedback
}

function countFillers(text: string) {
  return (text.match(FILLERS) ?? []).length
}

function extractQuestion(text: string) {
  const beforeFeedback = text.split('ANSWER_FEEDBACK:')[0]?.trim()
  return beforeFeedback?.replace(/```json[\s\S]*?```/g, '').trim() ?? text
}

function parseFeedback(text: string): AnswerFeedback | null {
  const match = text.match(/ANSWER_FEEDBACK:\s*(\{[\s\S]*?\})/)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as AnswerFeedback
  } catch {
    return null
  }
}

function parseComplete(text: string): VoiceEndReport | null {
  const match = text.match(/interview_complete:\s*(\{[\s\S]*\})/)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as VoiceEndReport
  } catch {
    return null
  }
}

export default function VoiceInterviewPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('voice-interview')
  const history = useToolHistory()
  const [phase, setPhase] = useState<'setup' | 'interview' | 'results'>('setup')
  const { cv } = useDashboardCv()
  const [role, setRole] = useState('')
  const [style, setStyle] = useState<InterviewStyleId>('friendly')
  const [duration, setDuration] = useState<InterviewDurationId>('medium')
  const [error, setError] = useState('')

  const [currentQuestion, setCurrentQuestion] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [waitingForVoice, setWaitingForVoice] = useState(false)
  const [yourTurn, setYourTurn] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [fillerCount, setFillerCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [lastFeedback, setLastFeedback] = useState<AnswerFeedback | null>(null)
  const [turns, setTurns] = useState<TurnRecord[]>([])
  const [endReport, setEndReport] = useState<VoiceEndReport | null>(null)
  const [savedRole, setSavedRole] = useState('')
  const [hearPrompt, setHearPrompt] = useState(false)

  const setupRef = useRef({ cv: '', role: '', style: 'friendly', duration: 'medium', total: 10 })
  const messagesRef = useRef<{ role: string; content: string }[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordStartRef = useRef(0)
  const lastSpokenRef = useRef('')
  const savedRef = useRef(false)
  const sessionRef = useRef(0)
  const turnsRef = useRef<TurnRecord[]>([])
  const voiceOnRef = useRef(true)
  const phaseRef = useRef(phase)
  const submittingRef = useRef(false)
  const pendingAssistantRef = useRef('')

  const { speak, stop, speaking, loadingAudio, speechWarning } = useInterviewSpeech()
  const { voiceId, setVoiceId } = useInterviewVoicePreference()
  const [voiceOn, setVoiceOn] = useState(true)

  voiceOnRef.current = voiceOn
  phaseRef.current = phase
  turnsRef.current = turns

  const updateStats = useCallback((text: string) => {
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    setFillerCount(countFillers(text))
  }, [])

  const clearRecordTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const startRecordTimer = useCallback(() => {
    clearRecordTimer()
    recordStartRef.current = Date.now()
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - recordStartRef.current) / 1000))
    }, 500)
  }, [clearRecordTimer])

  const submitAnswerRef = useRef<(text?: string) => Promise<void>>(async () => {})

  const {
    supported: speechSupported,
    recording,
    transcript,
    start: startRecording,
    stop: stopRecording,
    setTranscript,
  } = useSpeechRecognition({
    onTranscript: (text) => updateStats(text),
    onUtteranceEnd: (text) => {
      if (text.trim() && !submittingRef.current && phaseRef.current === 'interview') {
        void submitAnswerRef.current(text)
      }
    },
  })

  const persistVoiceResults = useCallback(
    async (report: VoiceEndReport, sessionTurns: TurnRecord[]) => {
      if (savedRef.current) return
      savedRef.current = true

      const data: VoiceInterviewResultData = {
        report,
        turns: sessionTurns.map((t) => ({ question: t.question, transcript: t.transcript })),
        role: setupRef.current.role,
        style: setupRef.current.style,
        duration: setupRef.current.duration,
      }

      const ok = await saveInterviewResult({
        slug: 'voice-interview',
        title: `${data.role} · ${report.overall_score}/10`,
        inputSummary: `${data.role} · voice`,
        resultText: buildVoiceInterviewMarkdown(data),
        resultData: data as unknown as Record<string, unknown>,
      })
      if (ok) history.bumpHistory()
    },
    [history],
  )

  const handleHistoryLoad = useCallback(async (_text: string, id: string) => {
    const data = await loadInterviewResultData(id)
    if (!data?.report) return
    setEndReport(data.report as VoiceEndReport)
    setSavedRole((data.role as string) ?? '')
    setPhase('results')
    savedRef.current = true
    history.loadHistory(_text, id, () => {})
  }, [history])

  const abortInterviewSession = useCallback(() => {
    sessionRef.current += 1
    stopRecording({ silent: true })
    clearRecordTimer()
    stop()
    setStreaming(false)
    setWaitingForVoice(false)
    setYourTurn(false)
    submittingRef.current = false
  }, [stop, stopRecording, clearRecordTimer])

  const isSessionActive = (session: number) => session === sessionRef.current

  const beginYourTurn = useCallback(() => {
    if (!speechSupported || phaseRef.current !== 'interview') return
    unlockInterviewAudio()
    setYourTurn(true)
    setTranscript('')
    updateStats('')
    startRecordTimer()
    startRecording('')
  }, [speechSupported, setTranscript, startRecording, startRecordTimer, updateStats])

  const revealQuestion = useCallback((assistantText: string) => {
    setCurrentQuestion(extractQuestion(assistantText))
  }, [])

  const playAssistantSpeech = useCallback(
    async (assistantText: string, session: number) => {
      if (!voiceOnRef.current || !assistantText.trim()) {
        revealQuestion(assistantText)
        beginYourTurn()
        return 'none' as const
      }

      if (assistantText === lastSpokenRef.current) {
        revealQuestion(assistantText)
        beginYourTurn()
        return 'none' as const
      }

      lastSpokenRef.current = assistantText
      setWaitingForVoice(true)
      setCurrentQuestion('')
      setYourTurn(false)
      setHearPrompt(false)

      const result = await speak(assistantText, voiceId, {
        onStart: () => {
          if (!isSessionActive(session)) return
          setWaitingForVoice(false)
          revealQuestion(assistantText)
        },
        onEnd: () => {
          if (!isSessionActive(session)) return
          beginYourTurn()
        },
      })

      if (!isSessionActive(session)) return result

      setWaitingForVoice(false)
      if (result === 'none' || result === 'blocked') {
        revealQuestion(assistantText)
        setHearPrompt(true)
        beginYourTurn()
      }

      return result
    },
    [beginYourTurn, revealQuestion, speak, voiceId],
  )

  const sendTurn = async (
    isStart: boolean,
    answerText?: string,
    stats?: { wordCount: number; fillerCount: number; durationSec: number },
  ) => {
    const session = sessionRef.current
    stopRecording({ silent: true })
    clearRecordTimer()
    setYourTurn(false)
    setStreaming(true)
    setError('')
    setHearPrompt(false)

    if (voiceOnRef.current) {
      setCurrentQuestion('')
    }

    let assistantText = ''
    pendingAssistantRef.current = ''

    const payload: Record<string, unknown> = {
      cv: setupRef.current.cv,
      role: setupRef.current.role,
      style: setupRef.current.style,
      duration: setupRef.current.duration,
      messages: messagesRef.current,
      stream: true,
    }

    if (stats) {
      payload.fillerCount = stats.fillerCount
      payload.wordCount = stats.wordCount
      payload.durationSec = stats.durationSec
    }

    const res = await streamToolApi('/api/tools/voice-interview', payload, (chunk) => {
      if (!isSessionActive(session)) return
      assistantText += chunk
      pendingAssistantRef.current = assistantText
      if (!voiceOnRef.current) {
        setCurrentQuestion(extractQuestion(assistantText))
      }
    })

    setStreaming(false)
    if (!isSessionActive(session)) return

    if (res.ok === false) {
      setError(res.error)
      if (voiceOnRef.current && pendingAssistantRef.current) {
        revealQuestion(pendingAssistantRef.current)
      }
      return
    }

    messagesRef.current.push({ role: 'assistant', content: assistantText })

    const complete = parseComplete(assistantText)
    if (complete) {
      await playAssistantSpeech(assistantText, session)
      if (!isSessionActive(session)) return
      setSavedRole(setupRef.current.role)
      setEndReport(complete)
      setPhase('results')
      void persistVoiceResults(complete, turnsRef.current)
      return
    }

    const fb = parseFeedback(assistantText)
    if (fb) setLastFeedback(fb)

    await playAssistantSpeech(assistantText, session)

    if (answerText) {
      setTurns((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last) last.feedback = fb ?? undefined
        return updated
      })
    }
  }

  const playQuestion = useCallback(async () => {
    const text = pendingAssistantRef.current || currentQuestion
    if (!text || !voiceOn) return
    unlockInterviewAudio()
    setHearPrompt(false)
    stopRecording({ silent: true })
    clearRecordTimer()
    setYourTurn(false)
    const session = sessionRef.current
    const result = await speak(text, voiceId, {
      onStart: () => {
        if (!isSessionActive(session)) return
        revealQuestion(text)
      },
      onEnd: () => {
        if (!isSessionActive(session)) return
        beginYourTurn()
      },
    })
    if (result === 'none' || result === 'blocked') setHearPrompt(true)
  }, [beginYourTurn, clearRecordTimer, currentQuestion, revealQuestion, speak, stopRecording, voiceId, voiceOn])

  const submitAnswer = useCallback(
    async (textOverride?: string) => {
      const answer = (textOverride ?? transcript).trim()
      if (!answer || streaming || submittingRef.current) return

      submittingRef.current = true
      stopRecording({ silent: true })
      clearRecordTimer()
      setYourTurn(false)

      const stats = {
        wordCount: answer.trim() ? answer.trim().split(/\s+/).length : 0,
        fillerCount: countFillers(answer),
        durationSec: elapsed,
      }
      const q = currentQuestion || extractQuestion(pendingAssistantRef.current)

      setTurns((prev) => [...prev, { question: q, transcript: answer, ...stats }])
      messagesRef.current.push({ role: 'user', content: answer })

      setTranscript('')
      setWordCount(0)
      setFillerCount(0)
      setElapsed(0)
      setLastFeedback(null)

      try {
        await sendTurn(false, answer, stats)
      } finally {
        submittingRef.current = false
      }
    },
    [clearRecordTimer, currentQuestion, elapsed, stopRecording, streaming, setTranscript, transcript],
  )

  submitAnswerRef.current = submitAnswer

  const start = async () => {
    unlockInterviewAudio()
    const total = interviewQuestionCount(duration)
    sessionRef.current += 1
    setupRef.current = { cv, role, style, duration, total }
    messagesRef.current = []
    setTurns([])
    setLastFeedback(null)
    setEndReport(null)
    setCurrentQuestion('')
    savedRef.current = false
    setHearPrompt(false)
    setYourTurn(false)
    lastSpokenRef.current = ''
    setPhase('interview')
    await sendTurn(true)
  }

  useEffect(() => () => abortInterviewSession(), [abortInterviewSession])

  const endEarly = () => {
    if (!window.confirm('End this interview? Your progress will not be saved.')) return
    abortInterviewSession()
    setPhase('setup')
  }

  const shellProps = {
    access,
    isPro,
    used,
    limit,
    toolSlug: 'voice-interview' as const,
    historyRefresh: history.refreshKey,
    historyActiveId: history.activeId,
    onHistoryLoad: handleHistoryLoad,
  }

  const interviewerBusy = streaming || waitingForVoice || loadingAudio || speaking

  if (loading) return null

  if (phase === 'results' && endReport) {
    return (
      <ToolShell
        {...shellProps}
        title="Voice Interview — Results"
        subtitle="Speech pattern report"
        needsCv={false}
        results
      >
        <InterviewResultsDashboard
          variant="voice"
          report={endReport}
          role={savedRole || setupRef.current.role}
          onRetry={() => {
            setPhase('setup')
            setEndReport(null)
            savedRef.current = false
          }}
        />
      </ToolShell>
    )
  }

  if (phase === 'interview') {
    return (
      <ToolShell {...shellProps} title="Voice Mock Interview" subtitle="Live session" needsCv={false} wide immersive>
        <InterviewRoomShell
          role={setupRef.current.role}
          styleId={setupRef.current.style}
          questionIndex={turns.length + 1}
          totalQuestions={setupRef.current.total}
          voiceOn={voiceOn}
          onVoiceToggle={() => {
            setVoiceOn((v) => {
              if (v) stop()
              return !v
            })
            setHearPrompt(false)
          }}
          speaking={speaking}
          loadingAudio={loadingAudio || waitingForVoice}
          waiting={streaming}
          canReplay={Boolean((pendingAssistantRef.current || currentQuestion) && !speaking && !loadingAudio)}
          onReplay={() => void playQuestion()}
          onEnd={endEarly}
        >
          <InterviewVoiceStage
            question={currentQuestion}
            transcript={transcript}
            recording={recording}
            streaming={streaming}
            wordCount={wordCount}
            fillerCount={fillerCount}
            elapsed={elapsed}
            lastFeedback={lastFeedback}
            hearPrompt={hearPrompt && voiceOn}
            voiceLoading={loadingAudio || waitingForVoice}
            yourTurn={yourTurn}
            interviewerBusy={interviewerBusy}
            speechSupported={speechSupported}
            onHearQuestion={() => void playQuestion()}
            onStartRecord={() => {
              if (interviewerBusy) return
              unlockInterviewAudio()
              beginYourTurn()
            }}
            onStopRecord={() => {
              stopRecording()
              clearRecordTimer()
              setYourTurn(false)
            }}
            onSubmit={() => void submitAnswer()}
          />
        </InterviewRoomShell>
        {speechWarning && (
          <div className="dash-voice-browser-warn" role="status">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            <p>{speechWarning}</p>
          </div>
        )}
        {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      </ToolShell>
    )
  }

  return (
    <ToolShell
      {...shellProps}
      title="Voice Mock Interview"
      subtitle="Pro · ElevenLabs voice · speak your answers"
      needsCv
      wide
    >
      {!speechSupported && (
        <div className="dash-voice-browser-warn">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          <p>
            Voice transcription works best in <strong>Chrome</strong> or <strong>Edge</strong>. Safari and Firefox may
            not support it —{' '}
            <Link href="/dashboard/tools/mock-interview" className="dash-voice-browser-warn__link">
              use text mode instead
            </Link>
            .
          </p>
        </div>
      )}
      <InterviewSetupWizard
        variant="voice"
        role={role}
        onRoleChange={setRole}
        style={style}
        onStyleChange={setStyle}
        duration={duration}
        onDurationChange={setDuration}
        voiceId={voiceId}
        onVoiceChange={setVoiceId}
        onStart={start}
        startLabel="Start voice interview"
      />
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
    </ToolShell>
  )
}
