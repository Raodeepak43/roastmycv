'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { InterviewResultsDashboard } from '@/components/dashboard/interview/InterviewResultsDashboard'
import { InterviewRoomShell } from '@/components/dashboard/interview/InterviewRoomShell'
import { InterviewSetupWizard } from '@/components/dashboard/interview/InterviewSetupWizard'
import { InterviewTranscript } from '@/components/dashboard/interview/InterviewTranscript'
import type { ChatMessage, InterviewFeedbackItem, MockInterviewComplete } from '@/components/dashboard/interview/types'
import { InterviewAnswerInput } from '@/components/dashboard/tools/InterviewAnswerInput'
import { useInterviewSpeech } from '@/components/dashboard/tools/useInterviewSpeech'
import { useInterviewVoicePreference } from '@/components/dashboard/tools/InterviewVoicePicker'
import { useSpeechRecognition } from '@/components/dashboard/tools/useSpeechRecognition'
import { ToolError, ToolPaywall, ToolShell } from '@/components/dashboard/tools/ToolShell'
import { callToolApi, streamToolApi, useToolHistory, useToolPlan } from '@/components/dashboard/tools/useToolPlan'
import {
  buildMockInterviewMarkdown,
  loadInterviewResultData,
  saveInterviewResult,
  type MockInterviewResultData,
} from '@/lib/tools/dashboard/interview-history'
import {
  closingSpeechBeforeComplete,
  isInterviewReadyToScore,
  parseMockInterviewComplete,
} from '@/lib/tools/dashboard/mock-interview-parse'
import {
  interviewQuestionCount,
  type InterviewDurationId,
  type InterviewStyleId,
} from '@/lib/tools/dashboard/interview-setup'

export default function MockInterviewPage() {
  const { isPro, used, limit, loading, access } = useToolPlan('mock-interview')
  const history = useToolHistory()
  const { cv, hasCv, loading: cvLoading } = useDashboardCv()
  const [phase, setPhase] = useState<'setup' | 'interview' | 'results'>('setup')
  const [role, setRole] = useState('')
  const [style, setStyle] = useState<InterviewStyleId>('friendly')
  const [duration, setDuration] = useState<InterviewDurationId>('medium')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [waitingVoice, setWaitingVoice] = useState(false)
  const [error, setError] = useState('')
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [summary, setSummary] = useState<string | undefined>()
  const [topMistakes, setTopMistakes] = useState<string[]>([])
  const [improvementTips, setImprovementTips] = useState<string[]>([])
  const [feedback, setFeedback] = useState<InterviewFeedbackItem[]>([])
  const [savedRole, setSavedRole] = useState('')
  const [finishing, setFinishing] = useState(false)
  const setupRef = useRef({ cv: '', role: '', style: 'friendly', duration: 'medium', total: 10 })
  const lastSpokenRef = useRef('')
  const messagesRef = useRef<ChatMessage[]>([])
  const submittingRef = useRef(false)
  const voiceOnRef = useRef(true)
  const phaseRef = useRef(phase)
  const streamingRef = useRef(false)
  const savedRef = useRef(false)
  const sessionRef = useRef(0)
  const { speak, stop, speaking, loadingAudio } = useInterviewSpeech()
  const { voiceId, setVoiceId } = useInterviewVoicePreference()
  const [voiceOn, setVoiceOn] = useState(true)

  voiceOnRef.current = voiceOn
  phaseRef.current = phase
  streamingRef.current = streaming
  messagesRef.current = messages

  const submitAnswerRef = useRef<(text?: string) => Promise<void>>(async () => {})

  const {
    supported: speechSupported,
    recording,
    start: startRecording,
    stop: stopRecording,
  } = useSpeechRecognition({
    onTranscript: setInput,
    onUtteranceEnd: (text) => {
      if (
        text.trim() &&
        !streamingRef.current &&
        !submittingRef.current &&
        phaseRef.current === 'interview'
      ) {
        void submitAnswerRef.current(text)
      }
    },
  })

  const abortInterviewSession = useCallback(() => {
    sessionRef.current += 1
    stop()
    stopRecording({ silent: true })
    submittingRef.current = false
    setStreaming(false)
    setWaitingVoice(false)
    setFinishing(false)
  }, [stop, stopRecording])

  const isSessionActive = (session: number) => session === sessionRef.current

  const questionCount = messages.filter(
    (m) => m.role === 'assistant' && !m.content.includes('INTERVIEW_COMPLETE'),
  ).length

  const parseComplete = parseMockInterviewComplete

  const resetResults = () => {
    setOverallScore(null)
    setSummary(undefined)
    setTopMistakes([])
    setImprovementTips([])
    setFeedback([])
    setMessages([])
    setFinishing(false)
    savedRef.current = false
  }

  const persistResults = useCallback(
    async (parsed: MockInterviewComplete, transcript: ChatMessage[]) => {
      if (savedRef.current) return
      savedRef.current = true

      const data: MockInterviewResultData = {
        overallScore: parsed.overall_score,
        summary: parsed.summary,
        top_mistakes: parsed.top_mistakes,
        improvement_tips: parsed.improvement_tips,
        feedback: parsed.feedback ?? [],
        messages: transcript.filter((m) => !m.content.includes('INTERVIEW_COMPLETE')),
        role: setupRef.current.role,
        style: setupRef.current.style,
        duration: setupRef.current.duration,
      }

      const ok = await saveInterviewResult({
        slug: 'mock-interview',
        title: `${data.role} · ${data.overallScore}/10`,
        inputSummary: `${data.role} · ${data.style}`,
        resultText: buildMockInterviewMarkdown(data),
        resultData: data as unknown as Record<string, unknown>,
      })
      if (ok) history.bumpHistory()
    },
    [history],
  )

  const applyCompletion = useCallback(
    (parsed: MockInterviewComplete, assistantText: string, historyMsgs: ChatMessage[]) => {
      const cleanAssistant = closingSpeechBeforeComplete(assistantText)
      const transcript: ChatMessage[] = [...historyMsgs]
      if (cleanAssistant) {
        transcript.push({ role: 'assistant', content: cleanAssistant })
      }
      setMessages(transcript)
      setSavedRole(setupRef.current.role)
      setOverallScore(parsed.overall_score)
      setSummary(parsed.summary)
      setTopMistakes(parsed.top_mistakes ?? [])
      setImprovementTips(parsed.improvement_tips ?? [])
      setFeedback(parsed.feedback ?? [])
      setFinishing(false)
      setPhase('results')
      void persistResults(parsed, transcript)
    },
    [persistResults],
  )

  const applyResultData = (data: MockInterviewResultData) => {
    setOverallScore(data.overallScore)
    setSummary(data.summary)
    setTopMistakes(data.top_mistakes ?? [])
    setImprovementTips(data.improvement_tips ?? [])
    setFeedback(data.feedback ?? [])
    setMessages(data.messages ?? [])
    setSavedRole(data.role)
    setPhase('results')
    savedRef.current = true
  }

  const handleHistoryLoad = useCallback(async (_text: string, id: string) => {
    const data = await loadInterviewResultData(id)
    if (!data) return
    applyResultData(data as unknown as MockInterviewResultData)
    history.loadHistory(_text, id, () => {})
  }, [history])

  const revealAssistant = useCallback((assistantText: string, isStart: boolean) => {
    if (isStart) {
      setMessages([{ role: 'assistant', content: assistantText }])
      return
    }
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === 'assistant') {
        next[next.length - 1] = { role: 'assistant', content: assistantText }
      } else {
        next.push({ role: 'assistant', content: assistantText })
      }
      return next
    })
  }, [])

  const pushAssistantLive = useCallback((assistantText: string, isStart: boolean) => {
    if (isStart) {
      setMessages([{ role: 'assistant', content: assistantText }])
      return
    }
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === 'assistant') {
        next[next.length - 1] = { role: 'assistant', content: assistantText }
      } else {
        next.push({ role: 'assistant', content: assistantText })
      }
      return next
    })
  }, [])

  const sendTurn = async (historyMsgs: ChatMessage[], isStart = false) => {
    const session = sessionRef.current
    stopRecording({ silent: true })
    setStreaming(true)
    setError('')

    const isFinalTurn = !isStart && isInterviewReadyToScore(historyMsgs, setupRef.current.total)
    if (isFinalTurn) setFinishing(true)

    let assistantText = ''
    let apiError: string | null = null

    if (isFinalTurn) {
      setWaitingVoice(false)
      const finalRes = await callToolApi('/api/tools/mock-interview', {
        cv: setupRef.current.cv,
        role: setupRef.current.role,
        style: setupRef.current.style,
        duration: setupRef.current.duration,
        messages: historyMsgs,
        stream: false,
      })
      if (!isSessionActive(session)) return
      if (finalRes.ok === false) {
        apiError = finalRes.error
      } else {
        assistantText = String((finalRes.data as { result?: string })?.result ?? '')
      }
    } else {
      setWaitingVoice(voiceOnRef.current)
      const streamRes = await streamToolApi(
        '/api/tools/mock-interview',
        {
          cv: setupRef.current.cv,
          role: setupRef.current.role,
          style: setupRef.current.style,
          duration: setupRef.current.duration,
          messages: historyMsgs,
          stream: true,
        },
        (chunk) => {
          if (!isSessionActive(session)) return
          assistantText += chunk
          if (!voiceOnRef.current) {
            pushAssistantLive(assistantText, isStart && assistantText.length === chunk.length)
          }
        },
      )
      if (!isSessionActive(session)) return
      if (streamRes.ok === false) {
        apiError = streamRes.error
      }
    }

    setStreaming(false)
    if (!isSessionActive(session)) return

    if (apiError) {
      setWaitingVoice(false)
      setFinishing(false)
      setError(apiError)
      if (isStart) setPhase('setup')
      return
    }

    const spokenText = isFinalTurn ? closingSpeechBeforeComplete(assistantText) : assistantText
    const willComplete = parseComplete(assistantText) !== null

    if (!voiceOnRef.current) {
      setWaitingVoice(false)
      if (spokenText.trim()) {
        revealAssistant(spokenText, isStart)
      }
    } else if (assistantText.trim() && (isFinalTurn || assistantText !== lastSpokenRef.current)) {
      if (!isFinalTurn) lastSpokenRef.current = assistantText
      await speak(assistantText, voiceId, {
        onStart: () => {
          if (!isSessionActive(session)) return
          setWaitingVoice(false)
          revealAssistant(spokenText, isStart)
        },
        onEnd: () => {
          if (
            isSessionActive(session) &&
            phaseRef.current === 'interview' &&
            speechSupported &&
            !willComplete
          ) {
            startRecording('')
          }
        },
      })
      if (!isSessionActive(session)) return
      setWaitingVoice(false)
    } else {
      setWaitingVoice(false)
      if (spokenText.trim()) revealAssistant(spokenText, isStart)
    }

    let parsed = parseComplete(assistantText)

    if (!parsed && isFinalTurn) {
      const retry = await callToolApi('/api/tools/mock-interview', {
        cv: setupRef.current.cv,
        role: setupRef.current.role,
        style: setupRef.current.style,
        duration: setupRef.current.duration,
        messages: historyMsgs,
        stream: false,
      })
      if (!isSessionActive(session)) return
      if (retry.ok) {
        assistantText = String((retry.data as { result?: string })?.result ?? '')
        parsed = parseComplete(assistantText)
      }
    }

    if (parsed) {
      if (!isSessionActive(session)) return
      applyCompletion(parsed, assistantText, historyMsgs)
      return
    }

    if (isFinalTurn) {
      setFinishing(false)
      setError('Could not generate your score. Please try again or end the session.')
    }
  }

  const submitAnswer = useCallback(
    async (textOverride?: string) => {
      const answer = (textOverride ?? input).trim()
      if (!answer || streamingRef.current || submittingRef.current) return
      submittingRef.current = true
      stopRecording({ silent: true })
      const userMsg: ChatMessage = { role: 'user', content: answer }
      const historyMsgs = [
        ...messagesRef.current.filter((m) => !m.content.includes('INTERVIEW_COMPLETE')),
        userMsg,
      ]
      setMessages(historyMsgs)
      setInput('')
      try {
        await sendTurn(historyMsgs)
      } finally {
        submittingRef.current = false
      }
    },
    [input, stopRecording],
  )

  submitAnswerRef.current = submitAnswer

  const start = async () => {
    if (!hasCv || cv.trim().length < 50) {
      setError('Upload or paste your CV first (at least 50 characters).')
      return
    }
    if (!role.trim()) {
      setError('Enter a target role before starting.')
      return
    }
    const total = interviewQuestionCount(duration)
    sessionRef.current += 1
    setupRef.current = { cv, role: role.trim(), style, duration, total }
    resetResults()
    setError('')
    setPhase('interview')
    setMessages([])
    await sendTurn([], true)
  }

  useEffect(
    () => () => {
      abortInterviewSession()
    },
    [abortInterviewSession],
  )

  const toggleAnswerRecording = () => {
    if (recording) stopRecording()
    else startRecording(input)
  }

  const inputLocked = streaming || waitingVoice || loadingAudio || speaking || finishing

  const endEarly = () => {
    if (!window.confirm('End this interview? Your progress will not be saved.')) return
    abortInterviewSession()
    setPhase('setup')
  }

  const lastAssistant = messages.filter((m) => m.role === 'assistant').slice(-1)[0]

  const shellProps = {
    access,
    isPro,
    used,
    limit,
    toolSlug: 'mock-interview' as const,
    historyRefresh: history.refreshKey,
    historyActiveId: history.activeId,
    onHistoryLoad: handleHistoryLoad,
  }

  if (loading) return null

  if (phase === 'results' && overallScore !== null) {
    return (
      <ToolShell
        {...shellProps}
        title="Mock Interview — Results"
        subtitle="Your performance breakdown"
        needsCv={false}
        results
      >
        <InterviewResultsDashboard
          variant="mock"
          overallScore={overallScore}
          summary={summary}
          topMistakes={topMistakes}
          improvementTips={improvementTips}
          feedback={feedback}
          messages={messages}
          role={savedRole || setupRef.current.role}
          onRetry={() => {
            setPhase('setup')
            resetResults()
          }}
        />
      </ToolShell>
    )
  }

  if (phase === 'interview') {
    const total = setupRef.current.total
    return (
      <ToolShell {...shellProps} title="Mock Interview" subtitle="Live session" needsCv={false} wide immersive>
        <InterviewRoomShell
          role={setupRef.current.role}
          styleId={setupRef.current.style}
          questionIndex={questionCount}
          totalQuestions={total}
          scoring={finishing}
          voiceOn={voiceOn}
          onVoiceToggle={() => {
            setVoiceOn((v) => {
              if (v) stop()
              return !v
            })
          }}
          speaking={speaking}
          loadingAudio={loadingAudio}
          waiting={waitingVoice || streaming}
          canReplay={Boolean(lastAssistant && !speaking && !loadingAudio && !waitingVoice)}
          onReplay={() => {
            if (lastAssistant) void speak(lastAssistant.content, voiceId)
          }}
          onEnd={endEarly}
          footer={
            <InterviewAnswerInput
              variant="room"
              value={input}
              onChange={setInput}
              onSubmit={() => void submitAnswer()}
              disabled={inputLocked}
              recording={recording}
              speechSupported={speechSupported}
              onToggleRecord={toggleAnswerRecording}
            />
          }
        >
          <InterviewTranscript
            messages={messages}
            streaming={streaming}
            waiting={waitingVoice || finishing}
            loadingAudio={loadingAudio}
          />
        </InterviewRoomShell>
        {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
      </ToolShell>
    )
  }

  return (
    <ToolShell
      {...shellProps}
      title="Mock Interview"
      subtitle="Real-time voice interview — speak or type your answers."
      needsCv
    >
      <InterviewSetupWizard
        role={role}
        onRoleChange={setRole}
        style={style}
        onStyleChange={setStyle}
        duration={duration}
        onDurationChange={setDuration}
        voiceId={voiceId}
        onVoiceChange={setVoiceId}
        onStart={start}
        starting={streaming || cvLoading}
        startLabel="Start interview"
      />
      {error && (error.includes('Pro') ? <ToolPaywall message={error} /> : <ToolError message={error} />)}
    </ToolShell>
  )
}
