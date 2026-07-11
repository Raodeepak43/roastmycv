'use client'

import { Volume2, VolumeX, PhoneOff, RotateCcw } from 'lucide-react'
import { InterviewerPanel } from '@/components/dashboard/interview/InterviewerPanel'

type Props = {
  role: string
  styleId: string
  questionIndex: number
  totalQuestions: number
  voiceOn: boolean
  onVoiceToggle: () => void
  speaking?: boolean
  loadingAudio?: boolean
  waiting?: boolean
  scoring?: boolean
  onReplay?: () => void
  canReplay?: boolean
  onEnd: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function InterviewRoomShell({
  role,
  styleId,
  questionIndex,
  totalQuestions,
  voiceOn,
  onVoiceToggle,
  speaking,
  loadingAudio,
  waiting,
  scoring,
  onReplay,
  canReplay,
  onEnd,
  children,
  footer,
}: Props) {
  const progress = totalQuestions > 0 ? Math.min(100, (questionIndex / totalQuestions) * 100) : 0

  return (
    <div className="dash-interview-room">
      <div className="dash-interview-room__topbar">
        <div className="dash-interview-room__topbar-left">
          <span className={`dash-interview-room__live${scoring ? ' dash-interview-room__live--scoring' : ''}`}>
            <span className="dash-interview-room__live-dot" aria-hidden />
            {scoring ? 'Scoring interview' : 'Live session'}
          </span>
          <div className="dash-interview-room__progress-wrap">
            <span className="dash-interview-room__progress-label">
              {scoring
                ? 'Generating your score & feedback…'
                : `Question ${Math.min(questionIndex, totalQuestions)} of ${totalQuestions}`}
            </span>
            <div className="dash-interview-room__progress">
              <div className="dash-interview-room__progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="dash-interview-room__controls">
          <button
            type="button"
            className={`dash-interview-room__ctrl ${voiceOn ? 'dash-interview-room__ctrl--on' : ''}`}
            onClick={onVoiceToggle}
          >
            {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            {voiceOn ? 'Voice on' : 'Voice off'}
          </button>
          {canReplay && onReplay && (
            <button type="button" className="dash-interview-room__ctrl" onClick={onReplay}>
              <RotateCcw className="size-4" />
              Replay
            </button>
          )}
          <button type="button" className="dash-interview-room__ctrl dash-interview-room__ctrl--danger" onClick={onEnd}>
            <PhoneOff className="size-4" />
            End
          </button>
        </div>
      </div>

      <div className="dash-interview-room__stage">
        <InterviewerPanel
          role={role}
          styleId={styleId}
          speaking={speaking}
          loadingAudio={loadingAudio}
          waiting={waiting || scoring}
        />
        <div className="dash-interview-room__content">{children}</div>
      </div>

      {footer && <div className="dash-interview-room__footer">{footer}</div>}
    </div>
  )
}
