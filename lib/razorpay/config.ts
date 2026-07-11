/** Server-only Razorpay config — never expose the secret key to the client. */

export function getRazorpayKeyId(): string | null {
  return (
    process.env.RAZORPAY_KEY_ID?.trim() ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    null
  )
}

export function getRazorpayKeySecret(): string | null {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || null
}

export function isRazorpayConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret())
}
