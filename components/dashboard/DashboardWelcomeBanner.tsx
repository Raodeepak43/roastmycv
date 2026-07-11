'use client'

import { useEffect, useState } from 'react'
import { DashboardLink } from '@/components/dashboard/DashboardLink'
import { Check, X } from 'lucide-react'
import {
  getOnboardingProgress,
  isOnboarded,
  setOnboarded,
  type OnboardingPage,
} from '@/lib/dashboard/onboarding'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'

const CHECKLIST: { id: OnboardingPage; label: string; href: string }[] = [
  { id: 'roast', label: 'Roast your CV — see what to fix', href: '/dashboard/roast' },
  { id: 'resume-builder', label: 'Build an ATS-ready resume', href: '/dashboard/resume-builder' },
  { id: 'plans', label: 'Unlock unlimited roasts (Pro)', href: '/dashboard/plans' },
]

function ProgressRing({ pct, label }: { pct: number; label: string }) {
  const r = 32
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="dash-welcome-progress">
      <div className="dash-w-ring">
        <svg width="74" height="74" viewBox="0 0 74 74" aria-hidden>
          <circle cx="37" cy="37" r={r} fill="none" stroke="#ececea" strokeWidth="6" />
          <circle
            cx="37"
            cy="37"
            r={r}
            fill="none"
            stroke="#ff5722"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <b>{Math.round(pct)}%</b>
      </div>
      <p>{label}</p>
    </div>
  )
}

export function DashboardWelcomeBanner() {
  const { userId } = useDashboardUser()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(getOnboardingProgress(userId))

  useEffect(() => {
    if (!userId) return
    setVisible(!isOnboarded(userId))
    setProgress(getOnboardingProgress(userId))
  }, [userId])

  useEffect(() => {
    if (!userId || !visible) return
    const tick = () => setProgress(getOnboardingProgress(userId))
    window.addEventListener('focus', tick)
    return () => window.removeEventListener('focus', tick)
  }, [userId, visible])

  if (!visible || !userId) return null

  const doneCount = CHECKLIST.filter(({ id }) => progress[id]).length
  const pct = Math.round((doneCount / CHECKLIST.length) * 100)

  const dismiss = () => {
    setOnboarded(userId)
    setVisible(false)
  }

  return (
    <div className="dash-card dash-welcome">
      <button type="button" className="dash-welcome__close" onClick={dismiss} aria-label="Dismiss welcome banner">
        <X className="size-4" />
      </button>
      <div className="dash-welcome__left">
        <h2>Get started with your job hunt</h2>
        <p>Three steps to an interview-ready CV:</p>
        <div className="dash-check-list">
          {CHECKLIST.map(({ id, label, href }) => {
            const done = progress[id]
            return (
              <DashboardLink key={id} href={href} className={`dash-check ${done ? 'dash-check--done' : ''}`}>
                <span className="dash-check__box" aria-hidden>
                  {done && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span>{label}</span>
              </DashboardLink>
            )
          })}
        </div>
      </div>
      <ProgressRing
        pct={pct}
        label={`${doneCount} of ${CHECKLIST.length} steps completed. Finish setup to unlock your best CV.`}
      />
    </div>
  )
}
