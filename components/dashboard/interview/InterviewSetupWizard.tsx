'use client'

import { Mic } from 'lucide-react'
import { InterviewVoicePicker } from '@/components/dashboard/tools/InterviewVoicePicker'
import { TargetRolePicker } from '@/components/dashboard/tools/TargetRolePicker'
import { AnimatedStepper, Step } from '@/components/ui/AnimatedStepper'
import type { InterviewVoiceId } from '@/lib/tools/dashboard/interview-voices'
import {
  INTERVIEW_DURATIONS,
  INTERVIEW_STYLES,
  type InterviewDurationId,
  type InterviewStyleId,
} from '@/lib/tools/dashboard/interview-setup'

type Props = {
  role: string
  onRoleChange: (v: string) => void
  style: InterviewStyleId
  onStyleChange: (v: InterviewStyleId) => void
  duration: InterviewDurationId
  onDurationChange: (v: InterviewDurationId) => void
  voiceId: InterviewVoiceId
  onVoiceChange: (v: InterviewVoiceId) => void
  onStart: () => void
  starting?: boolean
  startLabel?: string
  variant?: 'mock' | 'voice'
}

export function InterviewSetupWizard({
  role,
  onRoleChange,
  style,
  onStyleChange,
  duration,
  onDurationChange,
  voiceId,
  onVoiceChange,
  onStart,
  starting,
  startLabel = 'Start interview',
  variant = 'mock',
}: Props) {
  const canGoNext = (step: number) => (step === 1 ? role.trim().length > 0 : true)

  return (
    <div className={`dash-interview-wizard${variant === 'voice' ? ' dash-interview-wizard--voice' : ''}`}>
      {variant === 'voice' && (
        <div className="dash-voice-setup-hero">
          <div className="dash-voice-setup-hero__icon" aria-hidden>
            <Mic className="size-5" />
          </div>
          <div>
            <p className="dash-voice-setup-hero__title">Voice mock interview</p>
            <p className="dash-voice-setup-hero__sub">
              Speak naturally — we score your content, delivery, and filler words in real time.
            </p>
          </div>
        </div>
      )}

      <AnimatedStepper
        disableStepIndicators
        canGoNext={canGoNext}
        onFinalStepCompleted={onStart}
        footerLoading={starting}
        finalButtonText={startLabel}
        nextButtonProps={{ className: 'animated-stepper__next dash-tools-btn w-full sm:w-auto' }}
      >
        <Step title="Target role">
          <div className="dash-interview-wizard__panel">
            <TargetRolePicker
              value={role}
              onChange={onRoleChange}
              inputId="mock-interview-role"
              hint="Pick a suggestion or type your own — we tailor questions to your CV and this role."
            />
          </div>
        </Step>

        <Step title="Style & length">
          <div className="dash-interview-wizard__panel space-y-5">
            <div>
              <span className="dash-tools-label">Interview style</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERVIEW_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`dash-tools-chip ${style === s.id ? 'dash-tools-chip--active' : ''}`}
                    onClick={() => onStyleChange(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="dash-tools-label">Session length</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERVIEW_DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`dash-tools-chip ${duration === d.id ? 'dash-tools-chip--active' : ''}`}
                    onClick={() => onDurationChange(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Step>

        <Step title="Interviewer voice">
          <div className="dash-interview-wizard__panel">
            <p className="dash-interview-wizard__hint">The AI interviewer reads each question aloud when voice is on.</p>
            <div className="mt-4">
              <InterviewVoicePicker value={voiceId} onChange={onVoiceChange} />
            </div>
          </div>
        </Step>
      </AnimatedStepper>
    </div>
  )
}
