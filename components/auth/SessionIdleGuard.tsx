'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SESSION_IDLE_MS } from '@/lib/auth/idle-session'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const
const PING_INTERVAL_MS = 60_000
const CHECK_INTERVAL_MS = 30_000

type SessionIdleGuardProps = {
  enabled?: boolean
  onSignOut?: () => Promise<void> | void
}

export function SessionIdleGuard({ enabled = true, onSignOut }: SessionIdleGuardProps) {
  const router = useRouter()
  const lastActivityRef = useRef(Date.now())
  const signingOutRef = useRef(false)

  const expireSession = useCallback(async () => {
    if (signingOutRef.current) return
    signingOutRef.current = true
    try {
      if (onSignOut) {
        await onSignOut()
      } else {
        await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
        router.push('/login?reason=session_expired')
        router.refresh()
      }
    } finally {
      signingOutRef.current = false
    }
  }, [onSignOut, router])

  const pingActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/activity', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })
      if (res.status === 401) {
        await expireSession()
      }
    } catch {
      /* network blip — retry on next tick */
    }
  }, [expireSession])

  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (!enabled) return

    void pingActivity()

    const onActivity = () => {
      markActive()
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastActivityRef.current > SESSION_IDLE_MS) {
          void expireSession()
          return
        }
        void pingActivity()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const pingTimer = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current < PING_INTERVAL_MS) {
        void pingActivity()
      }
    }, PING_INTERVAL_MS)

    const checkTimer = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > SESSION_IDLE_MS) {
        void expireSession()
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity)
      }
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(pingTimer)
      window.clearInterval(checkTimer)
    }
  }, [enabled, expireSession, markActive, pingActivity])

  return null
}
