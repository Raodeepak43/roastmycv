'use client'

import { UserRound } from 'lucide-react'
import { interviewStyleLabel } from '@/lib/tools/dashboard/interview-setup'

type Props = {
  role: string
  styleId: string
  speaking?: boolean
  loadingAudio?: boolean
  waiting?: boolean
}

export function InterviewerPanel({ role, styleId, speaking, loadingAudio, waiting }: Props) {
  const status = speaking
    ? 'Speaking'
    : loadingAudio
      ? 'Preparing voice'
      : waiting
        ? 'Thinking'
        : 'Listening'

  const statusClass = speaking
    ? 'dash-interview-room__status-pill--speak'
    : waiting || loadingAudio
      ? 'dash-interview-room__status-pill--think'
      : 'dash-interview-room__status-pill--listen'

  const active = speaking || loadingAudio || waiting

  return (
    <div className="dash-interview-room__panel">
      <div className="dash-interview-room__avatar-wrap">
        <div
          className={`dash-interview-room__avatar ${speaking ? 'dash-interview-room__avatar--speaking' : ''}`}
        >
          <UserRound className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        {active && (
          <div className="dash-interview-room__waveform dash-interview-room__waveform--inline" aria-hidden>
            <span /><span /><span /><span /><span />
          </div>
        )}
      </div>
      <div className="dash-interview-room__meta">
        <p className="dash-interview-room__name">AI Interviewer</p>
        <p className="dash-interview-room__role">
          {role || 'Target role'} · {interviewStyleLabel(styleId)}
        </p>
      </div>
      <span className={`dash-interview-room__status-pill ${statusClass}`}>{status}</span>
    </div>
  )
}
