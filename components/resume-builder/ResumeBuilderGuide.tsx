'use client'

import { useState } from 'react'
import type { UiStrings } from '@/app/i18n'
import { GUIDE_STEP_IDS, type GuideStepId } from '@/lib/resume-builder/guide-steps'

type Copy = NonNullable<UiStrings['resumeBuilderOnboarding']>

interface ResumeBuilderGuideProps {
  active: boolean
  stepIndex: number
  copy: Copy
  name: string
  onNameChange: (name: string) => void
  nameError?: string
  isRtl?: boolean
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onDownload: () => void
}

export function ResumeBuilderGuide({
  active,
  stepIndex,
  copy,
  name,
  onNameChange,
  nameError,
  isRtl = false,
  onNext,
  onBack,
  onSkip,
  onDownload,
}: ResumeBuilderGuideProps) {
  const [localError, setLocalError] = useState('')

  if (!active) return null

  const step = copy.guideSteps[stepIndex]
  const stepId = (step?.id ?? 'welcome') as GuideStepId
  const total = copy.guideSteps.length
  const isWelcome = stepId === 'welcome'
  const isDownload = stepId === 'download'
  const isLast = stepIndex === total - 1

  const stepLabel = copy.stepOf
    .replace('{n}', String(stepIndex + 1))
    .replace('{total}', String(total))

  const handleNext = () => {
    if (isWelcome) {
      const trimmed = name.trim()
      if (trimmed.length < 2) {
        setLocalError(copy.nameError)
        return
      }
      setLocalError('')
    }
    onNext()
  }

  const displayError = nameError || localError

  return (
    <div className="rb-guide" dir={isRtl ? 'rtl' : 'ltr'} role="region" aria-label="Resume builder guide">
      <div className="rb-guide-panel neo-frame neo-frame--ember">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-body text-[10px] uppercase tracking-wider text-ember">{stepLabel}</span>
          <button
            type="button"
            onClick={onSkip}
            className="font-body text-[10px] text-dim hover:text-white"
          >
            {copy.skip}
          </button>
        </div>

        <div className="mb-2 flex gap-1">
          {GUIDE_STEP_IDS.map((id, i) => (
            <span
              key={id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-ember' : 'bg-subtle'
              }`}
              aria-hidden
            />
          ))}
        </div>

        <p className="font-display text-base leading-snug text-white">{step?.title}</p>
        <p className="mt-1 font-body text-[12px] leading-relaxed text-dim">{step?.desc}</p>

        {isWelcome && (
          <div className="mt-3">
            <label className="mb-1 block font-body text-[10px] uppercase tracking-wider text-muted">
              {copy.yourName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                onNameChange(e.target.value)
                setLocalError('')
              }}
              placeholder={copy.namePlaceholder}
              maxLength={60}
              className="w-full rounded-lg border border-border bg-page px-3 py-2.5 font-body text-sm text-white placeholder:text-muted outline-none focus:border-ember"
            />
            {displayError && <p className="mt-1 font-body text-xs text-red-400">{displayError}</p>}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {stepIndex > 0 && (
            <button type="button" onClick={onBack} className="rb-public-btn-secondary shrink-0 px-4">
              {copy.back}
            </button>
          )}
          {isDownload ? (
            <>
              <button type="button" onClick={onDownload} className="btn-roast flex-1 py-2.5 text-sm">
                {copy.downloadNow}
              </button>
              <button type="button" onClick={onSkip} className="rb-public-btn-secondary shrink-0 px-4">
                {copy.finish}
              </button>
            </>
          ) : (
            <button type="button" onClick={handleNext} className="btn-roast flex-1 py-2.5 text-sm">
              {isLast ? copy.finish : copy.next}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function getGuideStepId(copy: Copy, stepIndex: number): GuideStepId {
  const id = copy.guideSteps[stepIndex]?.id
  if (id && GUIDE_STEP_IDS.includes(id as GuideStepId)) {
    return id as GuideStepId
  }
  return 'welcome'
}
