'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

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

const STEPS = ['Role details', 'Question types', 'Generate']

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
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const canNext = step === 0 ? jobTitle.trim().length > 0 && hasCv : step === 1 ? types.length > 0 : true

  return (
    <div className="dash-interview-wizard">
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
            <div className="dash-interview-wizard__panel space-y-4">
              {!hasCv && (
                <p className="dash-interview-wizard__warn">Paste or upload your CV above before generating questions.</p>
              )}
              <div>
                <label className="dash-tools-label">What role are you interviewing for?</label>
                <input
                  className="dash-tools-input mt-2"
                  value={jobTitle}
                  onChange={(e) => onJobTitleChange(e.target.value)}
                  placeholder="e.g. Data Analyst"
                />
              </div>
              <div>
                <label className="dash-tools-label">Company name (optional)</label>
                <input
                  className="dash-tools-input mt-2"
                  value={company}
                  onChange={(e) => onCompanyChange(e.target.value)}
                  placeholder="e.g. Flipkart"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="dash-interview-wizard__panel">
              <h3 className="dash-interview-wizard__title">Which question types?</h3>
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
          )}

          {step === 2 && (
            <div className="dash-interview-wizard__panel dash-interview-wizard__panel--summary">
              <h3 className="dash-interview-wizard__title">Ready to generate</h3>
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
          <button type="button" className="dash-tools-btn w-full sm:w-auto" disabled={busy || !canNext} onClick={onSubmit}>
            <Sparkles className="size-4" aria-hidden />
            {busy ? 'Generating…' : 'Generate my questions'}
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

export { QUESTION_TYPES }
