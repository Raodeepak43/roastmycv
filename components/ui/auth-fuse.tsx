'use client'

import { useState, useId, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { AuthAnimatedCharacters } from '@/components/auth/AuthAnimatedCharacters'
import { Logo } from '@/components/Logo'
import { navigateAfterAuth } from '@/lib/dashboard/paths'
import { safeRedirectPath } from '@/lib/auth/redirects'
import {
  AUTH_SERVER_ERROR,
  AUTH_SIGNIN_INVALID,
  AUTH_SIGNUP_INVALID,
  AUTH_SIGNUP_SUCCESS,
  AUTH_RESET_EXPIRED,
} from '@/lib/auth/messages'

export interface PasswordInteraction {
  isTyping: boolean
  passwordLength: number
  showPassword: boolean
}

export interface TypewriterProps {
  text: string | string[]
  speed?: number
  cursor?: string
  loop?: boolean
  deleteSpeed?: number
  delay?: number
  className?: string
}

export function Typewriter({
  text,
  speed = 100,
  cursor = '',
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [mounted, setMounted] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [textArrayIndex, setTextArrayIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[textArrayIndex] || ''

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setDisplayText('')
    setCurrentIndex(0)
    setIsDeleting(false)
    setTextArrayIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (!mounted || !currentText) return

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex])
            setCurrentIndex((prev) => prev + 1)
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay)
          } else {
            setIsComplete(true)
          }
        } else if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1))
          setIsComplete(false)
        } else {
          setIsDeleting(false)
          setCurrentIndex(0)
          setTextArrayIndex((prev) => (prev + 1) % textArray.length)
        }
      },
      isDeleting ? deleteSpeed : speed,
    )

    return () => clearTimeout(timeout)
  }, [
    mounted,
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    textArray.length,
  ])

  if (!mounted) {
    return <span className={className}>{Array.isArray(text) ? text[0] : text}</span>
  }

  const showCursor = !isComplete || loop

  return (
    <span className={className}>
      {displayText}
      {showCursor ? (
        cursor ? (
          <span className="auth-typewriter-cursor-char">{cursor}</span>
        ) : (
          <span className="auth-typewriter-cursor" aria-hidden="true" />
        )
      ) : null}
    </span>
  )
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  onInteractionChange?: (state: PasswordInteraction) => void
}

function PasswordInput({
  className,
  label,
  id: idProp,
  onInteractionChange,
  onFocus,
  onBlur,
  onChange,
  ...props
}: PasswordInputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [length, setLength] = useState(0)

  const emit = (next: Partial<{ isFocused: boolean; length: number; show: boolean }>) => {
    const focused = next.isFocused ?? isFocused
    const len = next.length ?? length
    const show = next.show ?? showPassword
    onInteractionChange?.({
      isTyping: focused,
      passwordLength: len,
      showPassword: show,
    })
  }

  return (
    <div className="auth-fuse-field">
      {label && (
        <label className="auth-fuse-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="auth-fuse-password-wrap">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`auth-fuse-input ${className ?? ''}`}
          onFocus={(e) => {
            setIsFocused(true)
            emit({ isFocused: true })
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            emit({ isFocused: false })
            onBlur?.(e)
          }}
          onChange={(e) => {
            const len = e.target.value.length
            setLength(len)
            emit({ length: len })
            onChange?.(e)
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => {
            setShowPassword((prev) => {
              const next = !prev
              emit({ show: next })
              return next
            })
          }}
          className="auth-fuse-eye-btn"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

function SignInForm({
  authConfigured,
  onPasswordInteraction,
}: {
  authConfigured: boolean
  onPasswordInteraction?: (state: PasswordInteraction) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authConfigured) {
      setError('Add SUPABASE_ANON_KEY to .env.local and restart the dev server.')
      return
    }

    setLoading(true)
    setError('')

    const form = event.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? AUTH_SIGNIN_INVALID)
        return
      }
      navigateAfterAuth(searchParams.get('next'), router.push, router.refresh)
    } catch {
      setError(AUTH_SERVER_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="auth-fuse-form">
      <div className="auth-fuse-header">
        <h1>Sign in to your account</h1>
        <p>Enter your email below to sign in</p>
      </div>
      <div className="auth-fuse-fields">
        <div className="auth-fuse-field">
          <label className="auth-fuse-label" htmlFor="signin-email">
            Email
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="auth-fuse-input"
          />
        </div>
        <PasswordInput
          id="signin-password"
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Password"
          onInteractionChange={onPasswordInteraction}
        />
        <p className="auth-fuse-forgot-row">
          <Link href="/login/forgot-password" className="text-orange hover:text-white text-sm">
            Forgot password?
          </Link>
        </p>
        {error && <p className="auth-fuse-alert auth-fuse-alert-error">{error}</p>}
        <button type="submit" className="auth-fuse-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </form>
  )
}

function SignUpForm({
  authConfigured,
  onPasswordInteraction,
}: {
  authConfigured: boolean
  onPasswordInteraction?: (state: PasswordInteraction) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authConfigured) {
      setError('Add SUPABASE_ANON_KEY to .env.local and restart the dev server.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const form = event.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? AUTH_SIGNUP_INVALID)
        return
      }
      if (!data.needsEmailConfirm) {
        navigateAfterAuth(searchParams.get('next'), router.push, router.refresh)
        return
      }
      setMessage(data.message ?? AUTH_SIGNUP_SUCCESS)
    } catch {
      setError(AUTH_SERVER_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="auth-fuse-form">
      <div className="auth-fuse-header">
        <h1>Create an account</h1>
        <p>Enter your details below to sign up</p>
      </div>
      <div className="auth-fuse-fields">
        <div className="auth-fuse-field">
          <label className="auth-fuse-label" htmlFor="signup-name">
            Full Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            className="auth-fuse-input"
          />
        </div>
        <div className="auth-fuse-field">
          <label className="auth-fuse-label" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="auth-fuse-input"
          />
        </div>
        <PasswordInput
          id="signup-password"
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="Password"
          minLength={6}
          onInteractionChange={onPasswordInteraction}
        />
        {error && <p className="auth-fuse-alert auth-fuse-alert-error">{error}</p>}
        {message && <p className="auth-fuse-alert auth-fuse-alert-success">{message}</p>}
        <button type="submit" className="auth-fuse-btn" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </div>
    </form>
  )
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  authConfigured,
  onPasswordInteraction,
}: {
  isSignIn: boolean
  onToggle: () => void
  authConfigured: boolean
  onPasswordInteraction?: (state: PasswordInteraction) => void
}) {
  return (
    <>
      {isSignIn ? (
        <SignInForm authConfigured={authConfigured} onPasswordInteraction={onPasswordInteraction} />
      ) : (
        <SignUpForm authConfigured={authConfigured} onPasswordInteraction={onPasswordInteraction} />
      )}
      <p className="auth-fuse-toggle-row">
        {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button type="button" className="auth-fuse-btn auth-fuse-btn-link" onClick={onToggle}>
          {isSignIn ? 'Sign up' : 'Sign in'}
        </button>
      </p>
      <div className="auth-fuse-divider">
        <span>Or continue with</span>
      </div>
      <GoogleSignInButton authConfigured={authConfigured} />
      <p className="auth-fuse-plans-link">
        <Link href="/plans">View plans &amp; what we offer →</Link>
      </p>
    </>
  )
}

interface AuthContentProps {
  quote?: { text: string; author: string }
}

interface AuthUIProps {
  authConfigured: boolean
  signInContent?: AuthContentProps
  signUpContent?: AuthContentProps
}

const defaultSignInContent = {
  quote: {
    text: 'Welcome back! Ready to fix that resume?',
    author: 'MyCVRoast',
  },
}

const defaultSignUpContent = {
  quote: {
    text: 'Create an account. Your next roast awaits.',
    author: 'MyCVRoast',
  },
}

export function AuthUI({
  authConfigured,
  signInContent = {},
  signUpContent = {},
}: AuthUIProps) {
  const searchParams = useSearchParams()
  const [isSignIn, setIsSignIn] = useState(true)
  const [passwordInteraction, setPasswordInteraction] = useState<PasswordInteraction>({
    isTyping: false,
    passwordLength: 0,
    showPassword: false,
  })

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setIsSignIn(false)
  }, [searchParams])

  const handleToggleMode = () => {
    setIsSignIn((p) => !p)
    setPasswordInteraction({ isTyping: false, passwordLength: 0, showPassword: false })
  }

  const finalSignInContent = {
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  }
  const finalSignUpContent = {
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  }

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent
  const configError = searchParams.get('error') === 'auth'
  const resetExpired = searchParams.get('error') === 'reset_expired'
  const sessionExpired = searchParams.get('reason') === 'session_expired'
  const envError = searchParams.get('error') === 'config' || !authConfigured

  return (
    <div className="auth-fuse-theme">
      <div className="auth-fuse-form-panel">
        <div className="auth-fuse-form-inner">
          <div className="auth-fuse-mobile-brand md:hidden">
            <Logo variant="light" href="/" className="auth-fuse-brand-logo" />
          </div>
          {envError && (
            <div className="auth-fuse-alert auth-fuse-alert-warn">
              <strong>Auth not configured.</strong> Add your public auth key to{' '}
              <code>.env.local</code> as <code>SUPABASE_ANON_KEY</code>, then restart the dev server.
            </div>
          )}
          {sessionExpired && (
            <p className="auth-fuse-alert auth-fuse-alert-warn">
              Your session expired after 30 minutes of inactivity. Please sign in again.
            </p>
          )}
          {resetExpired && (
            <p className="auth-fuse-alert auth-fuse-alert-error">
              {AUTH_RESET_EXPIRED}{' '}
              <Link href="/login/forgot-password" className="text-orange underline">
                Request a new link
              </Link>
            </p>
          )}
          {configError && (
            <p className="auth-fuse-alert auth-fuse-alert-error">
              Google sign-in failed. In Google Cloud Console, add this redirect URI exactly:
              <code style={{ display: 'block', marginTop: '0.5rem', wordBreak: 'break-all' }}>
                https://rrtokbvxauxsgtjmuqof.supabase.co/auth/v1/callback
              </code>
            </p>
          )}
          <AuthFormContainer
            isSignIn={isSignIn}
            onToggle={handleToggleMode}
            authConfigured={authConfigured}
            onPasswordInteraction={setPasswordInteraction}
          />
        </div>
      </div>

      <div className="auth-fuse-brand-panel" aria-hidden="false">
        <div className="auth-fuse-brand-bg" aria-hidden="true">
          <div className="auth-fuse-brand-glow" />
          <div className="auth-fuse-brand-grid" />
          <div className="auth-fuse-brand-vignette" />
        </div>

        <div className="auth-fuse-brand-top">
          <Logo variant="dark" href="/" className="auth-fuse-brand-logo" />
          <p className="auth-fuse-brand-tagline">AI-POWERED · INSTANT · FREE</p>
          <div className="auth-fuse-brand-badges">
            <span>📄 ATS Resume</span>
            <span>🔥 CV Roast</span>
            <span>⚡ Live Score</span>
          </div>
        </div>

        <div className="auth-fuse-brand-center">
          <AuthAnimatedCharacters
            isTyping={passwordInteraction.isTyping}
            passwordLength={passwordInteraction.passwordLength}
            showPassword={passwordInteraction.showPassword}
          />
        </div>

        <div className="auth-fuse-quote-wrap">
          <blockquote className="auth-fuse-quote">
            <p>
              &ldquo;
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />
              &rdquo;
            </p>
            <cite>— {currentContent.quote.author}</cite>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
