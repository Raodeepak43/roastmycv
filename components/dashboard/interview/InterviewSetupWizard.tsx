'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Mic } from 'lucide-react'
import { InterviewVoicePicker } from '@/components/dashboard/tools/InterviewVoicePicker'
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

const STEPS = ['Role', 'Style & length', 'Voice']

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
  const [step, setStep] = useState(0)

  const canNext = step === 0 ? role.trim().length > 0 : true
  const isLast = step === STEPS.length - 1

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

      <div className="dash-interview-wizard__steps">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`dash-interview-wizard__step ${i === step ? 'dash-interview-wizard__step--active' : ''} ${i < step ? 'dash-interview-wizard__step--done' : ''}`}
          >
            <span className="dash-interview-wizard__step-num">{i + 1}</span>
            {label}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="dash-interview-wizard__body"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="dash-interview-wizard__panel">
              <h3 className="dash-interview-wizard__title">What role are you interviewing for?</h3>
              <p className="dash-interview-wizard__hint">We tailor questions to your CV and this role.</p>
              <input
                className="dash-tools-input mt-4"
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
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
          )}

          {step === 2 && (
            <div className="dash-interview-wizard__panel">
              <h3 className="dash-interview-wizard__title">Choose interviewer voice</h3>
              <p className="dash-interview-wizard__hint">ElevenLabs reads each question aloud when voice is on.</p>
              <div className="mt-4">
                <InterviewVoicePicker value={voiceId} onChange={onVoiceChange} />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="dash-interview-wizard__nav">
        {step > 0 ? (
          <button type="button" className="dash-tools-btn--ghost dash-tools-btn" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
        ) : (
          <span />
        )}
        {isLast ? (
          <button type="button" className="dash-tools-btn" disabled={starting} onClick={onStart}>
            <Mic className="size-4" aria-hidden />
            {starting ? 'Starting…' : startLabel}
          </button>
        ) : (
          <button
            type="button"
            className="dash-tools-btn"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
