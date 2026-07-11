'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { AutosaveIndicator } from '@/components/resume-builder/AutosaveIndicator'
import { ResumeBuilderUsageBadge } from '@/components/resume-builder/ResumeBuilderUsageBadge'
import { UpgradeModal } from '@/components/resume-builder/UpgradeModal'
import { ResumeBuilderWizard } from '@/components/resume-builder/wizard/ResumeBuilderWizard'
import { useResumeAutosave } from '@/components/resume-builder/useResumeAutosave'
import { useRoastPrefill } from '@/components/resume-builder/useRoastPrefill'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { markPageVisited } from '@/lib/dashboard/onboarding'
import { loadResumeDraftPayload, resumeDraftStorageKey } from '@/lib/resume-builder/draft-storage'
import { resolveTemplateId, type ResumeTemplateId } from '@/lib/resume-builder/templates'
import { defaultResumeData, type ResumeData } from '@/lib/resume-builder/types'
import {
  canDownloadPdf,
  incrementPdfDownloads,
} from '@/lib/resume-builder/usage'

interface AccountUsage {
  resumeAiLeft: number
  resumePdfLeft: number
  plan: string
}

export function ResumeBuilderApp({ embedded = false }: { embedded?: boolean }) {
  const { userId, name: profileName } = useDashboardUser()
  const draftKey = resumeDraftStorageKey(embedded && userId ? userId : 'public')
  const [data, setData] = useState<ResumeData>(defaultResumeData)
  const [screenIndex, setScreenIndex] = useState(0)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const { status: prefillStatus, filledCount: prefillFilledCount } = useRoastPrefill(setData)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeMode, setUpgradeMode] = useState<'paywall' | 'login'>('paywall')
  const [downloading, setDownloading] = useState(false)
  const [usageTick, setUsageTick] = useState(0)
  const [accountUsage, setAccountUsage] = useState<AccountUsage | null>(null)

  const templateId = resolveTemplateId(data.templateId)
  const saveStatus = useResumeAutosave(data, draftKey, draftLoaded, screenIndex)

  useEffect(() => {
    const fromRoast = new URLSearchParams(window.location.search).get('fromRoast')
    if (!fromRoast) {
      const payload = loadResumeDraftPayload(draftKey)
      if (payload?.data) {
        setData(payload.data)
        if (typeof payload.wizardStep === 'number') setScreenIndex(payload.wizardStep)
      } else if (embedded && profileName.trim()) {
        setData((prev) =>
          prev.personal.fullName ? prev : { ...prev, personal: { ...prev.personal, fullName: profileName.trim() } },
        )
      }
    }
    setDraftLoaded(true)
  }, [draftKey, embedded, profileName])

  const refreshUsage = () => setUsageTick((n) => n + 1)

  const loadAccountUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/resume-usage')
      if (!res.ok) return
      const json = await res.json()
      setAccountUsage({
        resumeAiLeft: json.usage?.resumeAiLeft ?? 0,
        resumePdfLeft: json.usage?.resumePdfLeft ?? 0,
        plan: json.usage?.plan ?? 'free',
      })
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (embedded && userId) markPageVisited(userId, 'resume-builder')
  }, [embedded, userId])

  useEffect(() => {
    if (embedded) loadAccountUsage()
  }, [embedded, loadAccountUsage, usageTick])

  const handlePaywall = useCallback(() => {
    setUpgradeMode('paywall')
    setUpgradeOpen(true)
  }, [])

  const setTemplate = useCallback((id: ResumeTemplateId) => {
    setData((prev) => ({ ...prev, templateId: id }))
  }, [])

  const downloadPdf = useCallback(async () => {
    if (embedded) {
      if (!accountUsage) return
      if (accountUsage.plan !== 'pro' && accountUsage.resumePdfLeft <= 0) {
        handlePaywall()
        return
      }
    } else if (!canDownloadPdf()) {
      setUpgradeMode('login')
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

      if (embedded) {
        await fetch('/api/dashboard/resume-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'pdf' }),
        })
        refreshUsage()
        await loadAccountUsage()
      } else {
        incrementPdfDownloads()
        refreshUsage()
      }
    } catch {
      /* ignore */
    } finally {
      setDownloading(false)
    }
  }, [accountUsage, data.personal.fullName, embedded, handlePaywall, loadAccountUsage])

  const consumeAccountAi = useCallback(async () => {
    await fetch('/api/dashboard/resume-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'ai' }),
    })
    refreshUsage()
    loadAccountUsage()
  }, [loadAccountUsage])

  const checkAccountAi = useCallback(() => {
    if (!accountUsage) return false
    return accountUsage.plan === 'pro' || accountUsage.resumeAiLeft > 0
  }, [accountUsage])

  const stepFormProps = useMemo(
    () => ({
      onUpgrade: handlePaywall,
      onAiUsed: refreshUsage,
      checkCanUseAi: embedded ? checkAccountAi : undefined,
      onAiConsumed: embedded ? consumeAccountAi : undefined,
      aiUpgradeHref: '/dashboard/plans',
    }),
    [embedded, handlePaywall, checkAccountAi, consumeAccountAi],
  )

  const toolbar = (
    <>
      <span className="rb-wizard__toolbar-meta">Step {screenIndex + 1}</span>
      <AutosaveIndicator status={saveStatus} theme="light" />
      {accountUsage && (
        <ResumeBuilderUsageBadge
          aiLeft={accountUsage.plan === 'pro' ? Infinity : accountUsage.resumeAiLeft}
          pdfLeft={accountUsage.plan === 'pro' ? Infinity : accountUsage.resumePdfLeft}
          isPro={accountUsage.plan === 'pro'}
          variant="light"
          upgradeHref="/dashboard/plans"
        />
      )}
      <button type="button" className="rb-wizard__toolbar-download" onClick={downloadPdf} disabled={downloading}>
        <Download size={15} strokeWidth={2} aria-hidden />
        {downloading ? 'Generating…' : 'Download PDF'}
      </button>
    </>
  )

  if (!embedded) {
    return null
  }

  return (
    <main className="dash-rb dash-rb--wizard">
      <ResumeBuilderWizard
        mode="dashboard"
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
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} mode={upgradeMode} loginNext="/dashboard/resume-builder" />
    </main>
  )
}
