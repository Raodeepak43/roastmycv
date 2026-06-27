'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { AtsScorePanel } from '@/components/resume-builder/AtsScorePanel'
import { ResumeEditorForm } from '@/components/resume-builder/ResumeEditorForm'
import { ResumePreview } from '@/components/resume-builder/ResumePreview'
import { UpgradeModal } from '@/components/resume-builder/UpgradeModal'
import { calculateATS } from '@/lib/resume-builder/ats-score'
import { defaultResumeData, type ResumeData } from '@/lib/resume-builder/types'
import {
  aiUsesLeft,
  canDownloadPdf,
  incrementPdfDownloads,
  pdfDownloadsLeft,
} from '@/lib/resume-builder/usage'

export function ResumeBuilderApp() {
  const [data, setData] = useState<ResumeData>(defaultResumeData)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [usageTick, setUsageTick] = useState(0)

  const ats = useMemo(() => calculateATS(data), [data])

  const refreshUsage = () => setUsageTick((n) => n + 1)

  const handleUpgrade = useCallback(() => setUpgradeOpen(true), [])

  const downloadPdf = useCallback(async () => {
    if (!canDownloadPdf()) {
      setUpgradeOpen(true)
      return
    }

    const element = document.getElementById('resume')
    if (!element) return

    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const name = data.personal.fullName.trim().replace(/\s+/g, '-') || 'resume'
      await html2pdf()
        .set({
          margin: 0,
          filename: `${name}-resume.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()

      incrementPdfDownloads()
      refreshUsage()

      if (!canDownloadPdf()) {
        setUpgradeOpen(true)
      }
    } catch {
      /* ignore */
    } finally {
      setDownloading(false)
    }
  }, [data.personal.fullName])

  const [usageLabel, setUsageLabel] = useState<string | null>(null)

  useEffect(() => {
    const ai = aiUsesLeft()
    const pdf = pdfDownloadsLeft()
    const aiText = ai === Infinity ? '∞' : String(ai)
    const pdfText = pdf === Infinity ? '∞' : String(pdf)
    setUsageLabel(`AI: ${aiText} · PDF: ${pdfText}`)
  }, [usageTick])

  return (
    <main className="min-h-screen flex flex-col bg-page">
      <header className="w-full border-b border-border bg-black/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="font-display text-lg text-white hover:text-orange transition-colors shrink-0"
            >
              🔥 MyCVRoast
            </Link>
            <span className="font-body text-[11px] text-dim hidden sm:inline">/</span>
            <span className="font-body text-[11px] text-orange truncate">Resume Builder</span>
          </div>
          <nav className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="font-body text-[11px] text-dim hover:text-orange transition-colors hidden sm:inline"
            >
              Roast CV
            </Link>
            <Link
              href="/blog"
              className="font-body text-[11px] text-dim hover:text-orange transition-colors hidden sm:inline"
            >
              Blog
            </Link>
            {usageLabel && (
              <span className="font-body text-[10px] text-[#555] hidden md:inline">
                {usageLabel}
              </span>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-2 min-h-0">
        {/* Editor */}
        <div className="border-r border-border overflow-y-auto max-h-[calc(100vh-57px)] lg:max-h-[calc(100vh-57px)]">
          <div className="p-4 md:p-6 max-w-xl lg:max-w-none mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl md:text-3xl text-white mb-1">
                ATS Resume Builder
              </h1>
              <p className="font-body text-[13px] text-dim">
                Amazon 10/10 clean template · single column · ATS safe
              </p>
            </div>

            <AtsScorePanel ats={ats} />

            <button
              type="button"
              onClick={downloadPdf}
              disabled={downloading}
              className="btn-roast w-full py-3.5 text-base mb-6 disabled:opacity-60"
            >
              {downloading ? '⏳ Generating PDF…' : '⬇ Download PDF — ATS Ready'}
            </button>

            <ResumeEditorForm
              data={data}
              onChange={setData}
              onUpgrade={handleUpgrade}
              onAiUsed={refreshUsage}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#e5e7eb] overflow-y-auto max-h-[calc(100vh-57px)] p-4 md:p-8">
          <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-2 lg:hidden">
            <span className="font-body text-[11px] text-[#666] uppercase tracking-wider">Live Preview</span>
            <span
              className="font-body text-[11px] font-medium px-2 py-1 rounded"
              style={{ color: ats.color, backgroundColor: `${ats.color}18` }}
            >
              ATS {ats.score}/100
            </span>
          </div>
          <div className="mx-auto shadow-lg">
            <ResumePreview data={data} />
          </div>
          <p className="font-body text-[10px] text-[#888] text-center mt-4 max-w-[780px] mx-auto">
            Preview matches PDF output exactly · Arial · single column · no tables
          </p>
        </div>
      </div>

      <SiteFooter support={undefined} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </main>
  )
}
