'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { PublicResumeBuilderHeader } from '@/components/resume-builder/PublicResumeBuilderHeader'
import { AutosaveIndicator } from '@/components/resume-builder/AutosaveIndicator'
import { ResumeBuilderWizard } from '@/components/resume-builder/wizard/ResumeBuilderWizard'
import { useResumeAutosave } from '@/components/resume-builder/useResumeAutosave'
import { useRoastPrefill } from '@/components/resume-builder/useRoastPrefill'
import { UpgradeModal } from '@/components/resume-builder/UpgradeModal'
import { loadResumeDraftPayload, resumeDraftStorageKey } from '@/lib/resume-builder/draft-storage'
import { resolveTemplateId, type ResumeTemplateId } from '@/lib/resume-builder/templates'
import { defaultResumeData, type ResumeData } from '@/lib/resume-builder/types'
import {
  canDownloadPublicPdf,
  canUsePublicAi,
  hasUsedFreePublicPdf,
  incrementPdfDownloads,
  publicPdfDownloadsLeft,
} from '@/lib/resume-builder/usage'
import { getConsentedDisplayName, stripUnconsentedName } from '@/lib/client-storage/display-name'

export function PublicResumeBuilder() {
  const draftKey = resumeDraftStorageKey('public')
  const [data, setData] = useState<ResumeData>(defaultResumeData)
  const [screenIndex, setScreenIndex] = useState(0)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const { status: prefillStatus, filledCount: prefillFilledCount } = useRoastPrefill(setData)
  const [loginOpen, setLoginOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [pdfLeft, setPdfLeft] = useState(1)
  const [mounted, setMounted] = useState(false)

  const templateId = resolveTemplateId(data.templateId)
  const saveStatus = useResumeAutosave(data, draftKey, draftLoaded, screenIndex)

  const setTemplate = useCallback((id: ResumeTemplateId) => {
    setData((prev) => ({ ...prev, templateId: id }))
  }, [])

  useEffect(() => {
    setMounted(true)
    setPdfLeft(publicPdfDownloadsLeft())

    const savedName = getConsentedDisplayName()
    const fromRoast = new URLSearchParams(window.location.search).get('fromRoast')

    if (!fromRoast) {
      const payload = loadResumeDraftPayload(draftKey)
      if (payload?.data) {
        const draft = stripUnconsentedName(payload.data)
        setData(draft)
        if (typeof payload.wizardStep === 'number') setScreenIndex(payload.wizardStep)
      } else if (savedName) {
        setData((prev) =>
          prev.personal.fullName ? prev : { ...prev, personal: { ...prev.personal, fullName: savedName } },
        )
      }
    }

    setDraftLoaded(true)
  }, [draftKey])

  const promptLogin = useCallback(() => {
    setLoginOpen(true)
  }, [])

  const downloadPdf = useCallback(async () => {
    if (!canDownloadPublicPdf()) {
      promptLogin()
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
      setPdfLeft(publicPdfDownloadsLeft())

      if (!canDownloadPublicPdf()) {
        promptLogin()
      }
    } catch {
      /* ignore */
    } finally {
      setDownloading(false)
    }
  }, [data.personal.fullName, promptLogin])

  const pdfUsed = mounted && hasUsedFreePublicPdf()

  const stepFormProps = useMemo(
    () => ({
      onUpgrade: promptLogin,
      checkCanUseAi: () => canUsePublicAi(),
      aiLockedLabel: 'Sign in for AI',
      aiUpgradeHref: '/login?next=%2Fdashboard%2Fresume-builder',
    }),
    [promptLogin],
  )

  const toolbar = (
    <>
      <span className="rb-wizard__toolbar-meta">
        {pdfLeft > 0 ? `${pdfLeft} free PDF` : 'Sign in for more PDFs'}
      </span>
      <AutosaveIndicator status={saveStatus} theme="light" />
      <button type="button" className="rb-wizard__toolbar-download" onClick={downloadPdf} disabled={downloading}>
        <Download size={15} strokeWidth={2} aria-hidden />
        {downloading ? 'Generating…' : 'Download PDF'}
      </button>
    </>
  )

  return (
    <main className="rb-public rb-public--builder-page">
      <PublicResumeBuilderHeader pdfLeft={mounted ? pdfLeft : 1} />

      {pdfUsed && (
        <div className="rb-public-builder-banner">
          <p>Free PDF used — sign in for AI bullet fixes and more downloads.</p>
          <Link href="/login?next=%2Fdashboard%2Fresume-builder">Sign in free</Link>
        </div>
      )}

      <div className="rb-public-builder-shell">
        <ResumeBuilderWizard
          mode="public"
          data={data}
          onChange={setData}
          screenIndex={screenIndex}
          onScreenIndexChange={setScreenIndex}
          templateId={templateId}
          onTemplateChange={setTemplate}
          onDownload={downloadPdf}
          downloading={downloading}
          toolbar={toolbar}
          prefillBanner={{ status: prefillStatus, filledCount: prefillFilledCount }}
          stepFormProps={stepFormProps}
        />
      </div>

      <UpgradeModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        mode="login"
        loginNext="/dashboard/resume-builder"
      />
    </main>
  )
}
