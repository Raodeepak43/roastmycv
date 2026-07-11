import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/auth/rate-limit'
import { authStoreGet, authStoreSet, hashAuthKey } from '@/lib/auth/store'
import { isResendConfigured, sendContactAutoReply, sendContactEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

const TOPICS = new Set(['general', 'billing', 'bug', 'partnership'])
const CONTACT_LIMIT = 5
const CONTACT_WINDOW_SEC = 60 * 60

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function checkContactRateLimit(ip: string): Promise<boolean> {
  const key = `contact:ip:${hashAuthKey(ip)}`
  const raw = await authStoreGet(key)
  const count = raw ? parseInt(raw, 10) : 0
  if (count >= CONTACT_LIMIT) return false
  await authStoreSet(key, String(count + 1), CONTACT_WINDOW_SEC)
  return true
}

export async function POST(req: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ error: 'Email is not configured on the server' }, { status: 503 })
    }

    const ip = getClientIp(req)
    if (!(await checkContactRateLimit(ip))) {
      return NextResponse.json({ error: 'Too many messages — try again in an hour' }, { status: 429 })
    }

    let body: {
      name?: string
      email?: string
      topic?: string
      message?: string
      website?: string
    }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (body.website?.trim()) {
      return NextResponse.json({ ok: true })
    }

    const name = body.name?.trim() ?? ''
    const email = body.email?.trim().toLowerCase() ?? ''
    const topic = body.topic?.trim().toLowerCase() ?? ''
    const message = body.message?.trim() ?? ''

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'Enter your name (2–80 characters)' }, { status: 400 })
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }
    if (!TOPICS.has(topic)) {
      return NextResponse.json({ error: 'Select a topic' }, { status: 400 })
    }
    if (message.length < 20 || message.length > 4000) {
      return NextResponse.json({ error: 'Message must be 20–4000 characters' }, { status: 400 })
    }

    const topicLabel =
      topic === 'billing'
        ? 'Billing & refunds'
        : topic === 'bug'
          ? 'Bug report'
          : topic === 'partnership'
            ? 'Partnership'
            : 'General'

    await sendContactEmail({ name, email, topic: topicLabel, message })
    await sendContactAutoReply({ name, email })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/contact]', err)
    return NextResponse.json({ error: 'Could not send message — try again or email us directly' }, { status: 500 })
  }
}
