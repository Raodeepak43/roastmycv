'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildPublicRoastPayload } from '@/lib/public-roasts'
import type { IntensityKey } from '@/app/i18n'

function isHinglish(language: string): boolean {
  return language === 'hinglish'
}

function buildLinkedInPost(
  score: number,
  language: string,
  issues: string[],
): string {
  const [i1, i2, i3] = issues
  if (isHinglish(language)) {
    return `3 mahine job apply kiya. 0 interview calls aaye. 😶

Phir MyCVRoast ne mera resume roast kiya — ${score}/10 💀

AI ne pakda:
❌ ${i1}
❌ ${i2}
❌ ${i3}

Ek raat mein fix kiya. Resume builder se ATS score improve kiya.

Ab interview calls aa rahe hain. 🙏

Kisi bhi job seeker ko share karo — free hai: mycvroast.in

#JobSearch #ResumeHelp #CareerAdvice #MyCVRoast`
  }

  return `Applied to 50+ jobs. Got 0 interview calls. 😶

Then MyCVRoast roasted my CV — ${score}/10 💀

AI found:
❌ ${i1}
❌ ${i2}
❌ ${i3}

Fixed it overnight using the free resume builder.

Now getting responses. 🙏

Free for everyone → mycvroast.in

#JobSearch #ResumeReview #CareerAdvice #MyCVRoast`
}

export function LinkedInPostModal({
  open,
  onClose,
  score,
  language,
  lines,
  fixes,
  title,
  verdict,
}: {
  open: boolean
  onClose: () => void
  score: number
  language: string
  lines: string[]
  fixes?: string[]
  title?: string
  verdict?: string
}) {
  const [copied, setCopied] = useState(false)

  const initialPost = useMemo(() => {
    const { top_issues } = buildPublicRoastPayload({
      score,
      intensity: 'gaali_light' as IntensityKey,
      language,
      lines,
      title,
      verdict,
      fixes,
    })
    return buildLinkedInPost(score, language, top_issues)
  }, [score, language, lines, fixes, title, verdict])

  const [postText, setPostText] = useState(initialPost)

  useEffect(() => {
    if (open) setPostText(initialPost)
  }, [open, initialPost])

  if (!open) return null

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(postText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="linkedin-post-title"
      onClick={onClose}
    >
      <div
        className="neo-frame neo-frame--orange w-full max-w-lg bg-[#0a0a0a] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="linkedin-post-title" className="font-display text-lg text-white">
            💼 LinkedIn Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={14}
            className="w-full resize-y bg-black/60 border border-white/15 rounded-none px-4 py-3 font-body text-sm text-white/90 leading-relaxed focus:border-orange outline-none"
          />

          <p className="font-body text-xs text-white/50">
            Copy the post above, then paste it on LinkedIn (Ctrl+V / Cmd+V)
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={copyPost}
              className="flex-1 font-body text-sm py-3 px-4 bg-orange text-black font-semibold hover:bg-orange/90 transition-colors"
            >
              {copied ? '✅ Copied!' : '📋 Copy post'}
            </button>
            <button
              type="button"
              onClick={() => window.open('https://www.linkedin.com/feed/', '_blank', 'noopener,noreferrer')}
              className="flex-1 font-body text-sm py-3 px-4 border border-[#0077B5]/60 text-[#0077B5] hover:bg-[#0077B5]/10 transition-colors"
            >
              Open LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
