'use client'

import { ArrowLeft, Sparkles } from 'lucide-react'

export function WizardFooter({
  canBack,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  showTips,
  onTips,
  continueDisabled,
}: {
  canBack: boolean
  onBack: () => void
  onContinue: () => void
  continueLabel?: string
  showTips?: boolean
  onTips?: () => void
  continueDisabled?: boolean
}) {
  return (
    <footer className="rb-wizard__footer">
      <button type="button" className="rb-wizard__back" onClick={onBack} disabled={!canBack}>
        <ArrowLeft size={16} strokeWidth={2} aria-hidden />
        Back
      </button>
      <div className="rb-wizard__footer-actions">
        {showTips && onTips && (
          <button type="button" className="rb-wizard__tips-btn" onClick={onTips}>
            <Sparkles size={14} strokeWidth={2} aria-hidden />
            Tips &amp; fixes
          </button>
        )}
        <button
          type="button"
          className="rb-wizard__continue"
          onClick={onContinue}
          disabled={continueDisabled}
        >
          {continueLabel}
        </button>
      </div>
    </footer>
  )
}
