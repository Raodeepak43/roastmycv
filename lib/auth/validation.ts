import { z } from 'zod'
import {
  AUTH_BODY_INVALID,
  AUTH_SIGNIN_INVALID,
  AUTH_SIGNUP_INVALID,
} from '@/lib/auth/messages'

export { AUTH_BODY_INVALID, AUTH_SIGNIN_INVALID, AUTH_SIGNUP_INVALID }

const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const HTML_TAG = /<[^>]*>/g
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

/** Strip HTML/script tags and control characters from text fields */
export function sanitizeTextInput(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw.replace(SCRIPT_TAG, '').replace(HTML_TAG, '').replace(CONTROL_CHARS, '').trim()
}

/** Passwords keep special chars; only remove markup and control bytes */
export function sanitizePasswordInput(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw.replace(SCRIPT_TAG, '').replace(HTML_TAG, '').replace(CONTROL_CHARS, '')
}

const emailSchema = z
  .string()
  .min(3, 'too_short')
  .max(254, 'too_long')
  .email('invalid_format')
  .transform((value) => value.toLowerCase())

const passwordSchema = z.string().min(6, 'too_short').max(128, 'too_long')

const displayNameSchema = z
  .string()
  .min(1, 'too_short')
  .max(100, 'too_long')
  .refine((value) => !/[<>{}[\]\\/`]/.test(value), 'invalid_chars')

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: displayNameSchema,
})

export type SignInPayload = z.infer<typeof signInSchema>
export type SignUpPayload = z.infer<typeof signUpSchema>

function logValidationFailure(route: 'signin' | 'signup', codes: string[]) {
  console.warn(`[auth/${route}] validation failed`, {
    codes,
    count: codes.length,
  })
}

function issueCodes(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message)
}

export function parseSignInBody(body: unknown):
  | { ok: true; data: SignInPayload }
  | { ok: false } {
  if (!body || typeof body !== 'object') {
    logValidationFailure('signin', ['invalid_body'])
    return { ok: false }
  }

  const record = body as Record<string, unknown>
  const candidate = {
    email: sanitizeTextInput(record.email),
    password: sanitizePasswordInput(record.password),
  }

  const result = signInSchema.safeParse(candidate)
  if (!result.success) {
    logValidationFailure('signin', issueCodes(result.error))
    return { ok: false }
  }

  return { ok: true, data: result.data }
}

export function parseSignUpBody(body: unknown):
  | { ok: true; data: SignUpPayload }
  | { ok: false } {
  if (!body || typeof body !== 'object') {
    logValidationFailure('signup', ['invalid_body'])
    return { ok: false }
  }

  const record = body as Record<string, unknown>
  const candidate = {
    email: sanitizeTextInput(record.email),
    password: sanitizePasswordInput(record.password),
    name: sanitizeTextInput(record.name),
  }

  const result = signUpSchema.safeParse(candidate)
  if (!result.success) {
    logValidationFailure('signup', issueCodes(result.error))
    return { ok: false }
  }

  return { ok: true, data: result.data }
}
