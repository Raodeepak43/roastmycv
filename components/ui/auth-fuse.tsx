'use client'

import { useState, useId, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

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
  cursor = '|',
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

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[textArrayIndex] || ''

  useEffect(() => {
    setMounted(true)
  }, [])

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
          }
        } else if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1))
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
    return <span className={className} aria-hidden />
  }

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  )
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

function PasswordInput({ className, label, id: idProp, ...props }: PasswordInputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const [showPassword, setShowPassword] = useState(false)

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
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="auth-fuse-eye-btn"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="auth-fuse-google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function SignInForm({ authConfigured }: { authConfigured: boolean }) {
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
        setError(data.error ?? 'Sign in failed')
        return
      }
      router.push(searchParams.get('next') || '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
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
            placeholder="m@example.com"
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
        />
        {error && <p className="auth-fuse-alert auth-fuse-alert-error">{error}</p>}
        <button type="submit" className="auth-fuse-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </form>
  )
}

function SignUpForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter()
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
        setError(data.error ?? 'Sign up failed')
        return
      }
      if (!data.needsEmailConfirm) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      setMessage('Check your email to confirm your account.')
    } catch {
      setError('Something went wrong. Try again.')
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
            placeholder="m@example.com"
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
}: {
  isSignIn: boolean
  onToggle: () => void
  authConfigured: boolean
}) {
  const handleGoogle = () => {
    if (!authConfigured) return
    window.location.href = '/api/auth/google'
  }

  return (
    <>
      {isSignIn ? (
        <SignInForm authConfigured={authConfigured} />
      ) : (
        <SignUpForm authConfigured={authConfigured} />
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
      <button
        type="button"
        className="auth-fuse-btn"
        onClick={handleGoogle}
        disabled={!authConfigured}
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </>
  )
}

interface AuthContentProps {
  image?: { src: string; alt: string }
  quote?: { text: string; author: string }
}

interface AuthUIProps {
  authConfigured: boolean
  signInContent?: AuthContentProps
  signUpContent?: AuthContentProps
}

const defaultSignInContent = {
  image: {
    src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern workspace with natural light',
  },
  quote: {
    text: 'Welcome back! Ready to fix that resume?',
    author: 'MyCVRoast',
  },
}

const defaultSignUpContent = {
  image: {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Team collaborating in a bright office',
  },
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

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setIsSignIn(false)
  }, [searchParams])

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  }
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  }

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent
  const configError = searchParams.get('error') === 'auth'
  const envError = searchParams.get('error') === 'config' || !authConfigured

  return (
    <div className="auth-fuse-theme">
      <div className="auth-fuse-form-panel">
        <div className="auth-fuse-form-inner">
          {envError && (
            <div className="auth-fuse-alert auth-fuse-alert-warn">
              <strong>Missing anon key.</strong> Open{' '}
              <a
                href="https://supabase.com/dashboard/project/rrtokbvxauxsgtjmuqof/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#fcd34d', textDecoration: 'underline' }}
              >
                Supabase → Settings → API
              </a>
              , copy the <code>anon</code> <code>public</code> key, add to{' '}
              <code>.env.local</code>:
              <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem', overflow: 'auto' }}>
                SUPABASE_ANON_KEY=paste_key_here
              </pre>
              Then restart: <code>rm -rf .next && npm run dev</code>
            </div>
          )}
          {configError && (
            <p className="auth-fuse-alert auth-fuse-alert-error">
              Sign-in failed. Check Google redirect URLs include{' '}
              <code>/auth/callback</code> in Supabase.
            </p>
          )}
          <AuthFormContainer
            isSignIn={isSignIn}
            onToggle={() => setIsSignIn((p) => !p)}
            authConfigured={authConfigured}
          />
        </div>
      </div>

      <div
        className="auth-fuse-image-panel"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        role="img"
        aria-label={currentContent.image.alt}
      >
        <div className="auth-fuse-image-gradient" />
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
