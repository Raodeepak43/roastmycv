/** Public (anonymous) resume builder limits — 1 free PDF, AI requires sign-in */
export const PUBLIC_FREE_PDF_LIMIT = 1
export const PUBLIC_FREE_AI_LIMIT = 0

/** Dashboard embedded builder uses separate limits via API */
export const DASHBOARD_FREE_AI_LIMIT = 5
export const DASHBOARD_FREE_PDF_LIMIT = 3

const AI_KEY = 'rb_ai_uses'
const PDF_KEY = 'rb_pdf_downloads'
const PAID_KEY = 'rb_paid'

export function isBuilderPaid(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PAID_KEY) === '1'
}

export function getAiUses(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(AI_KEY) ?? '0', 10) || 0
}

export function incrementAiUses(): number {
  const next = getAiUses() + 1
  localStorage.setItem(AI_KEY, String(next))
  return next
}

export function getPdfDownloads(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(PDF_KEY) ?? '0', 10) || 0
}

export function incrementPdfDownloads(): number {
  const next = getPdfDownloads() + 1
  localStorage.setItem(PDF_KEY, String(next))
  return next
}

/** Anonymous public page — no free AI; sign in for AI improvements */
export function canUsePublicAi(): boolean {
  return false
}

export function canDownloadPublicPdf(): boolean {
  return isBuilderPaid() || getPdfDownloads() < PUBLIC_FREE_PDF_LIMIT
}

export function publicPdfDownloadsLeft(): number {
  if (isBuilderPaid()) return Infinity
  return Math.max(0, PUBLIC_FREE_PDF_LIMIT - getPdfDownloads())
}

export function hasUsedFreePublicPdf(): boolean {
  return getPdfDownloads() >= PUBLIC_FREE_PDF_LIMIT && !isBuilderPaid()
}

/** @deprecated use public helpers on /resume-builder */
export const FREE_AI_LIMIT = PUBLIC_FREE_AI_LIMIT
export const FREE_PDF_LIMIT = PUBLIC_FREE_PDF_LIMIT

export function canUseAi(): boolean {
  return canUsePublicAi()
}

export function canDownloadPdf(): boolean {
  return canDownloadPublicPdf()
}

export function aiUsesLeft(): number {
  return 0
}

export function pdfDownloadsLeft(): number {
  return publicPdfDownloadsLeft()
}
