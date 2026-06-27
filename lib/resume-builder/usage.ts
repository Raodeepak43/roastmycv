const AI_KEY = 'rb_ai_uses'
const PDF_KEY = 'rb_pdf_downloads'
const PAID_KEY = 'rb_paid'

export const FREE_AI_LIMIT = 3
export const FREE_PDF_LIMIT = 1

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

export function canUseAi(): boolean {
  return isBuilderPaid() || getAiUses() < FREE_AI_LIMIT
}

export function canDownloadPdf(): boolean {
  return isBuilderPaid() || getPdfDownloads() < FREE_PDF_LIMIT
}

export function aiUsesLeft(): number {
  if (isBuilderPaid()) return Infinity
  return Math.max(0, FREE_AI_LIMIT - getAiUses())
}

export function pdfDownloadsLeft(): number {
  if (isBuilderPaid()) return Infinity
  return Math.max(0, FREE_PDF_LIMIT - getPdfDownloads())
}
