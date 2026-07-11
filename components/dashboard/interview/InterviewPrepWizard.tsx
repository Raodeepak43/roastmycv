'use client'

import { Sparkles } from 'lucide-react'
import { TargetCompanyPicker } from '@/components/dashboard/tools/TargetCompanyPicker'
import { TargetRolePicker } from '@/components/dashboard/tools/TargetRolePicker'
import { AnimatedStepper, Step } from '@/components/ui/AnimatedStepper'

const QUESTION_TYPES = ['Behavioural', 'Technical', 'CV-specific', 'Situational'] as const

type Props = {
  hasCv: boolean
  jobTitle: string
  onJobTitleChange: (v: string) => void
  company: string
  onCompanyChange: (v: string) => void
  types: string[]
  onToggleType: (t: string) => void
  onSubmit: () => void
  busy?: boolean
}

export function InterviewPrepWizard({
  hasCv,
  jobTitle,
  onJobTitleChange,
  company,
  onCompanyChange,
  types,
  onToggleType,
  onSubmit,
  busy,
}: Props) {
  const canGoNext = (step: number) => {
    if (step === 1) return jobTitle.trim().length > 0 && hasCv
    if (step === 2) return types.length > 0
    return true
  }

  return (
    <div className="dash-interview-wizard">
      <AnimatedStepper
        disableStepIndicators
        canGoNext={canGoNext}
        onFinalStepCompleted={onSubmit}
        footerLoading={busy}
        finalButtonText="Generate my questions"
        nextButtonProps={{ className: 'animated-stepper__next dash-tools-btn w-full sm:w-auto' }}
      >
        <Step title="Role details">
          <div className="dash-interview-wizard__panel space-y-4">
            {!hasCv && (
              <p className="dash-interview-wizard__warn">Paste or upload your CV above before generating questions.</p>
            )}
            <TargetRolePicker value={jobTitle} onChange={onJobTitleChange} inputId="interview-prep-role" />
            <TargetCompanyPicker value={company} onChange={onCompanyChange} inputId="interview-prep-company" />
          </div>
        </Step>

        <Step title="Question types">
          <div className="dash-interview-wizard__panel">
            <p className="dash-interview-wizard__hint">Pick one or more — we tailor questions to your CV.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {QUESTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`dash-tools-chip ${types.includes(t) ? 'dash-tools-chip--active' : ''}`}
                  onClick={() => onToggleType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Step>

        <Step title="Ready to generate">
          <div className="dash-interview-wizard__panel dash-interview-wizard__panel--summary">
            <ul className="dash-interview-wizard__summary-list">
              <li>
                <strong>Role:</strong> {jobTitle}
              </li>
              {company && (
                <li>
                  <strong>Company:</strong> {company}
                </li>
              )}
              <li>
                <strong>Types:</strong> {types.join(', ')}
              </li>
            </ul>
            <p className="dash-interview-wizard__hint mt-4 flex items-center gap-1.5">
              <Sparkles className="size-4 shrink-0 text-[var(--dash-accent)]" aria-hidden />
              We&apos;ll generate tailored questions based on your CV and selections.
            </p>
          </div>
        </Step>
      </AnimatedStepper>
    </div>
  )
}

export { QUESTION_TYPES }
