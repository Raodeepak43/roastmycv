/** UPI support — override via Vercel / .env.local if needed */
export const SUPPORT_UPI_ID = process.env.NEXT_PUBLIC_UPI_ID?.trim() || ''
export const SUPPORT_UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME?.trim() || 'Deepak Yadav'
export const SUPPORT_UPI_QR = process.env.NEXT_PUBLIC_UPI_QR?.trim() || '/upi-qr.png'

export function getUpiPayLink(): string {
  if (!SUPPORT_UPI_ID) return ''
  const params = new URLSearchParams({
    pa: SUPPORT_UPI_ID,
    pn: SUPPORT_UPI_NAME,
    cu: 'INR',
  })
  return `upi://pay?${params.toString()}`
}

export function getUpiQrImageUrl(): string {
  return SUPPORT_UPI_QR || ''
}
