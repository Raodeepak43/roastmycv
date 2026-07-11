'use client'

import { Check, FileText } from 'lucide-react'
import { WIZARD_STEPS, type WizardStepId } from '@/lib/resume-builder/wizard-steps'

export function WizardStepper({
  activeStepId,
  completedThrough,
}: {
  activeStepId: WizardStepId
  completedThrough: number
}) {
  const activeIndex = WIZARD_STEPS.findIndex((s) => s.id === activeStepId)

  return (
    <aside className="rb-wizard__stepper">
      <div className="rb-wizard__brand">
        <FileText size={18} strokeWidth={2} aria-hidden />
        Resume Builder
      </div>
      <ol className="rb-wizard__steps">
        {WIZARD_STEPS.map((step, i) => {
          const done = i < activeIndex || (i <= completedThrough && i !== activeIndex)
          const active = i === activeIndex

          let stateClass = ''
          if (done && !active) stateClass = ' rb-wizard__step--done'
          else if (active) stateClass = ' rb-wizard__step--active'

          return (
            <li key={step.id} className={`rb-wizard__step${stateClass}`}>
              <span className="rb-wizard__step-icon" aria-hidden>
                {done && !active ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="rb-wizard__step-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
