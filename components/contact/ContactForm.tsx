'use client'

import { useState } from 'react'
import { SUPPORT_EMAIL } from '@/lib/support'

const TOPICS = [
  { value: 'general', label: 'General question' },
  { value: 'billing', label: 'Billing & refunds' },
  { value: 'bug', label: 'Bug report' },
  { value: 'partnership', label: 'Partnership' },
] as const

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, website }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Could not send message')
      }
      setSuccess(true)
      setName('')
      setEmail('')
      setTopic('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-orange/30 bg-orange/5 p-6 text-center">
        <p className="font-display text-xl text-text-dark mb-2">Message sent</p>
        <p className="font-body text-sm text-muted leading-relaxed">
          We received your message and sent a confirmation to your inbox. We reply within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 font-body text-sm text-orange hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block font-body text-[11px] uppercase tracking-[0.14em] text-muted mb-2">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-body text-sm text-text-dark outline-none focus:border-orange/50 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block font-body text-[11px] uppercase tracking-[0.14em] text-muted mb-2">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-body text-sm text-text-dark outline-none focus:border-orange/50 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="block font-body text-[11px] uppercase tracking-[0.14em] text-muted mb-2">
          Topic
        </label>
        <select
          id="contact-topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-body text-sm text-text-dark outline-none focus:border-orange/50 transition-colors"
        >
          <option value="" disabled>
            Select a topic
          </option>
          {TOPICS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block font-body text-[11px] uppercase tracking-[0.14em] text-muted mb-2">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 font-body text-sm text-text-dark outline-none focus:border-orange/50 transition-colors"
          placeholder="Describe your issue or question..."
        />
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {error ? (
        <p className="font-body text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3 font-body text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>

      <p className="font-body text-[12px] text-dim">
        Or email us directly at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-orange hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </form>
  )
}
