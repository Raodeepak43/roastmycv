'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { navigateAfterAuth } from '@/lib/dashboard/paths'
import {
  AUTH_PASSWORD_UPDATED,
  AUTH_PASSWORD_UPDATE_INVALID,
  AUTH_RESET_EXPIRED,
  AUTH_RESET_SUCCESS,
  AUTH_SERVER_ERROR,
} from '@/lib/auth/messages'
import { createClient, isSupabaseAuthConfigured } from '@/lib/supabase/client'

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="auth-fuse-theme min-h-screen">
      <div className="auth-fuse-form-panel" style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
        <div className="auth-fuse-form-inner">
          <div className="auth-fuse-mobile-brand">
            <Logo variant="light" href="/" className="auth-fuse-brand-logo" />
          </div>
          <div className="auth-fuse-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          <p className="auth-fuse-toggle-row">
            <Link href="/login" className="text-orange hover:text-white">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function ForgotPasswordForm({ authConfigured }: { authConfigured: boolean }) {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === 'reset_expired') {
      setError(AUTH_RESET_EXPIRED)
    } else if (searchParams.get('error') === 'auth') {
      setError('Sign-in link failed. Request a new password reset below.')
    }
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!authConfigured) {
      setError('Password reset is not configured on this server.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? AUTH_SERVER_ERROR)
        return
      }
      setMessage(data.message ?? AUTH_RESET_SUCCESS)
    } catch {
      setError(AUTH_SERVER_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email. We'll send a link to choose a new password."
    >
      <form onSubmit={handleSubmit} className="auth-fuse-form">
        <div className="auth-fuse-fields">
          <div className="auth-fuse-field">
            <label className="auth-fuse-label" htmlFor="reset-email">
              Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="auth-fuse-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="auth-fuse-alert auth-fuse-alert-error">{error}</p>}
          {message && <p className="auth-fuse-alert auth-fuse-alert-success">{message}</p>}
          <button type="submit" className="auth-fuse-btn" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

export function UpdatePasswordForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!authConfigured) {
      setChecking(false)
      setError('Password reset is not configured on this server.')
      return
    }

    void (async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        setHasSession(Boolean(data.session))
        if (!data.session) {
          setError(AUTH_PASSWORD_UPDATE_INVALID)
        }
      } catch {
        setError(AUTH_PASSWORD_UPDATE_INVALID)
      } finally {
        setChecking(false)
      }
    })()
  }, [authConfigured])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? AUTH_PASSWORD_UPDATE_INVALID)
        return
      }
      setMessage(data.message ?? AUTH_PASSWORD_UPDATED)
      const next = searchParams.get('next')
      setTimeout(() => {
        navigateAfterAuth(next, router.push, router.refresh)
      }, 1200)
    } catch {
      setError(AUTH_SERVER_ERROR)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <AuthShell title="Set new password" subtitle="Checking your reset link…">
        <p className="auth-fuse-loading">Loading…</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a new password for your MyCVRoast account."
    >
      {!hasSession ? (
        <div className="auth-fuse-fields">
          <p className="auth-fuse-alert auth-fuse-alert-error">{error || AUTH_PASSWORD_UPDATE_INVALID}</p>
          <Link href="/login/forgot-password" className="auth-fuse-btn inline-block text-center">
            Request new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-fuse-form">
          <div className="auth-fuse-fields">
            <div className="auth-fuse-field">
              <label className="auth-fuse-label" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="auth-fuse-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-fuse-field">
              <label className="auth-fuse-label" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="auth-fuse-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error && <p className="auth-fuse-alert auth-fuse-alert-error">{error}</p>}
            {message && <p className="auth-fuse-alert auth-fuse-alert-success">{message}</p>}
            <button type="submit" className="auth-fuse-btn" disabled={loading}>
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
