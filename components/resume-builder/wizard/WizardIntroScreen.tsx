'use client'

import { introCopyFor, type WizardStepId } from '@/lib/resume-builder/wizard-steps'

export function WizardIntroScreen({ stepId }: { stepId: WizardStepId }) {
  const copy = introCopyFor(stepId)
  const highlight = copy.title.replace(/^(Now, let's add your |Time to showcase your |Let's craft your )/i, '')

  return (
    <div className="rb-wizard__intro">
      {copy.kicker && <p className="rb-wizard__intro-kicker">{copy.kicker}</p>}
      <h2 className="rb-wizard__intro-title">
        {copy.title.includes(highlight) && highlight.length > 3 ? (
          <>
            {copy.title.replace(highlight, '')}
            <em>{highlight}</em>
          </>
        ) : (
          copy.title
        )}
      </h2>
      <p className="rb-wizard__intro-sub">{copy.subtitle}</p>
    </div>
  )
}
