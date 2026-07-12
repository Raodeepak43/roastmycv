'use client'

import { useCallback, useState } from 'react'
import { Link2, Share2 } from 'lucide-react'
import { LinkedInPostModal } from '@/components/roast/LinkedInPostModal'
import type { IntensityKey } from '@/app/i18n'

const SHARE_BASE = 'https://mycvroast.in'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function buildWhatsAppMessage(score: number, language: string, token: string): string {
  const url = `${SHARE_BASE}/roast/${token}`
  if (language === 'hinglish') {
    return `Bhai mera resume ${score}/10 aaya 💀 MyCVRoast ne roast kar diya. Tu bhi try kar — ${url}`
  }
  return `My CV just got roasted ${score}/10 💀 by AI. Brutal but true. Try yours free → ${url}`
}

type ShareBarVariant = 'light' | 'dark'

export function RoastShareBar({
  shareToken,
  score,
  language,
  intensity,
  lines,
  title,
  verdict,
  fixes,
  onVisibilityChange,
  variant = 'dark',
}: {
  shareToken: string
  score: number
  language: string
  intensity: IntensityKey
  lines: string[]
  title?: string
  verdict?: string
  fixes?: string[]
  onVisibilityChange?: (isPublic: boolean) => void
  variant?: ShareBarVariant
}) {
  const [isPublic, setIsPublic] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)
  const [linkedinOpen, setLinkedinOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const isLight = variant === 'light'

  const shareUrl = `${SHARE_BASE}/roast/${shareToken}`

  const copyShareLink = useCallback(async () => {
    if (!isPublic) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [isPublic, shareUrl])

  const togglePublic = useCallback(
    async (checked: boolean) => {
      setUpdating(true)
      try {
        const res = await fetch(`/api/public-roasts/${encodeURIComponent(shareToken)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_public: checked }),
        })
        if (res.ok) {
          setIsPublic(checked)
          onVisibilityChange?.(checked)
        }
      } catch {
        /* ignore */
      } finally {
        setUpdating(false)
      }
    },
    [shareToken, onVisibilityChange],
  )

  const openWhatsApp = () => {
    if (!isPublic) return
    const text = buildWhatsAppMessage(score, language, shareToken)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  if (isLight) {
    return (
      <>
        <div className="roast-result-panel">
          <header className="roast-result-panel__header">
            <h2 className="roast-result-panel__title">Share your roast</h2>
            <Share2 className="size-4 text-[var(--text-muted)]" aria-hidden />
          </header>
          <div className="roast-result-panel__body space-y-3">
            <div className="roast-result-actions">
              <button
                type="button"
                onClick={copyShareLink}
                disabled={!isPublic}
                className="roast-result-btn roast-result-btn--primary"
              >
                <Link2 className="size-4" aria-hidden />
                {linkCopied ? 'Link copied!' : 'Copy share link'}
              </button>

              <button
                type="button"
                onClick={openWhatsApp}
                disabled={!isPublic}
                className="roast-result-btn roast-result-btn--whatsapp"
              >
                <WhatsAppIcon />
                Share on WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setLinkedinOpen(true)}
                className="roast-result-btn roast-result-btn--secondary"
              >
                Generate LinkedIn post
              </button>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                checked={isPublic}
                disabled={updating}
                onChange={(e) => togglePublic(e.target.checked)}
                className="size-4 accent-[var(--color-orange)]"
              />
              <span className="text-xs leading-snug text-[var(--text-muted)]">Make my roast public</span>
            </label>

            {!isPublic && (
              <p className="text-xs text-[var(--text-faint)]">
                Private roasts cannot be shared via link or WhatsApp.
              </p>
            )}
          </div>
        </div>

        <LinkedInPostModal
          open={linkedinOpen}
          onClose={() => setLinkedinOpen(false)}
          score={score}
          language={language}
          lines={lines}
          fixes={fixes}
          title={title}
          verdict={verdict}
        />
      </>
    )
  }

  return (
    <>
      <div className="neo-frame neo-frame--orange rounded-none bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
        <p className="font-display text-center text-3xl md:text-4xl text-white tabular-nums">
          Your roast score: {score}/10 💀
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={copyShareLink}
            disabled={!isPublic}
            className="w-full font-body text-sm py-3 px-4 bg-orange text-black font-semibold hover:bg-orange/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {linkCopied ? '✅ Link copied!' : '📤 Share my roast'}
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            disabled={!isPublic}
            className="w-full font-body text-sm py-3 px-4 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <WhatsAppIcon />
            Share on WhatsApp
          </button>

          <button
            type="button"
            onClick={() => setLinkedinOpen(true)}
            className="w-full font-body text-sm py-3 px-4 border border-[#0077B5]/60 text-[#0077B5] hover:bg-[#0077B5]/10 transition-colors"
          >
            💼 Generate LinkedIn Post
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublic}
            disabled={updating}
            onChange={(e) => togglePublic(e.target.checked)}
            className="size-4 accent-orange"
          />
          <span className="font-body text-xs text-white/70">Make my roast public</span>
        </label>

        {!isPublic && (
          <p className="font-body text-xs text-white/45 text-center">
            Private roasts cannot be shared via link or WhatsApp.
          </p>
        )}
      </div>

      <LinkedInPostModal
        open={linkedinOpen}
        onClose={() => setLinkedinOpen(false)}
        score={score}
        language={language}
        lines={lines}
        fixes={fixes}
        title={title}
        verdict={verdict}
      />
    </>
  )
}
