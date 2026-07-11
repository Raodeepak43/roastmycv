'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const DEFAULT_STEPS = [
  'Reading your CV…',
  'Understanding your experience…',
  'Running AI analysis…',
  'Preparing your personalised report…',
  'Almost done…',
]

export function ToolAnalyzingPanel({
  title = 'Analysing',
  steps = DEFAULT_STEPS,
  hint = 'This usually takes 15–30 seconds. Please keep this tab open.',
}: {
  title?: string
  steps?: string[]
  hint?: string
}) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length)
    }, 2800)
    return () => window.clearInterval(id)
  }, [steps.length])

  return (
    <div className="tool-analyzing" role="status" aria-live="polite" aria-busy="true">
      <div className="tool-analyzing__orb" aria-hidden>
        <span className="tool-analyzing__ring" />
        <span className="tool-analyzing__ring tool-analyzing__ring--2" />
        <Sparkles className="tool-analyzing__icon" />
      </div>
      <h2 className="tool-analyzing__title">{title}</h2>
      <p className="tool-analyzing__step">{steps[stepIndex]}</p>
      <div className="tool-analyzing__bar" aria-hidden>
        <span className="tool-analyzing__bar-fill" />
      </div>
      <p className="tool-analyzing__hint">{hint}</p>
    </div>
  )
}
