import { Resend } from 'resend'
import { SUPPORT_EMAIL } from '@/lib/support'

let client: Resend | null = null

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  if (!client) client = new Resend(key)
  return client
}

function contactFromAddress(): string {
  const domain = process.env.RESEND_EMAIL_DOMAIN?.trim() || 'mycvroast.in'
  return `MyCVRoast <contact@${domain}>`
}

export type ContactEmailInput = {
  name: string
  email: string
  topic: string
  message: string
}

export async function sendContactEmail(input: ContactEmailInput): Promise<{ id: string }> {
  const resend = getResendClient()
  const { name, email, topic, message } = input

  const text = [
    'New contact form message on MyCVRoast',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    '',
    'Message:',
    message,
  ].join('\n')

  const { data, error } = await resend.emails.send({
    from: contactFromAddress(),
    to: SUPPORT_EMAIL,
    replyTo: email,
    subject: `[MyCVRoast Contact] ${topic} — ${name}`,
    text,
  })

  if (error) throw new Error(error.message)
  if (!data?.id) throw new Error('Resend did not return a message id')
  return { id: data.id }
}

export async function sendContactAutoReply(input: Pick<ContactEmailInput, 'name' | 'email'>): Promise<void> {
  const resend = getResendClient()
  const { name, email } = input

  const { error } = await resend.emails.send({
    from: contactFromAddress(),
    to: email,
    subject: 'We received your message — MyCVRoast',
    text: [
      `Hi ${name},`,
      '',
      'Thanks for contacting MyCVRoast. We received your message and will reply within 24 hours.',
      '',
      `If your question is urgent, you can also email us directly at ${SUPPORT_EMAIL}.`,
      '',
      '— MyCVRoast Support',
    ].join('\n'),
  })

  if (error) {
    console.warn('[email/resend] auto-reply failed:', error.message)
  }
}
