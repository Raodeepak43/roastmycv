'use client'

import { motion } from 'framer-motion'
import type { CareerToolDemoVariant } from '@/lib/tools/marketing/config'

type Props = {
  variant: CareerToolDemoVariant
  headline: string
}

export function CareerToolDemoMock({ variant, headline }: Props) {
  const previewLabel = (
    <span className="career-demo__pill career-demo__pill--preview">UI preview</span>
  )

  if (variant === 'interview') {
    return (
      <div className="career-demo career-demo--interview" aria-hidden>
        <div className="career-demo__room-top">
          {previewLabel}
          <span className="career-demo__progress">Question 3 of 10</span>
        </div>
        <div className="career-demo__room-body">
          <div className="career-demo__avatar">
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
          <div className="career-demo__chat">
            <div className="career-demo__bubble career-demo__bubble--ai">
              Tell me about a time you improved a metric on your last project.
            </div>
            <div className="career-demo__bubble career-demo__bubble--user">
              I led a checkout optimisation that cut drop-off by 18%…
            </div>
          </div>
        </div>
        <p className="career-demo__caption">{headline}</p>
      </div>
    )
  }

  if (variant === 'email') {
    return (
      <div className="career-demo career-demo--email" aria-hidden>
        <div className="career-demo__email-header">
          <span>To: hiring@company.com</span>
          <span>Subject: Application — Backend Engineer</span>
        </div>
        <div className="career-demo__email-body">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Hi team — I&apos;m applying for the backend role. At my last company I shipped payment APIs handling 2M
            daily transactions…
          </motion.p>
        </div>
      </div>
    )
  }

  if (variant === 'analysis') {
    return (
      <div className="career-demo career-demo--analysis" aria-hidden>
        <div className="career-demo__score-row">
          <motion.div
            className="career-demo__score-ring"
            initial={{ strokeDashoffset: 200 }}
            animate={{ strokeDashoffset: 60 }}
            transition={{ duration: 1.2 }}
          >
            <span>78%</span>
            <small>Match</small>
          </motion.div>
          <ul>
            <li className="career-demo__ok">Strong: Python, APIs</li>
            <li className="career-demo__gap">Gap: Kubernetes</li>
            <li className="career-demo__gap">Gap: stakeholder mgmt</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="career-demo career-demo--default" aria-hidden>
      <div className="career-demo__steps">
        {['Input CV', 'Add context', 'Get output'].map((s, i) => (
          <motion.div
            key={s}
            className="career-demo__step"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <span>{i + 1}</span>
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
