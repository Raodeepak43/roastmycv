'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Download } from 'lucide-react'
import type { ResumeData } from '@/lib/resume-builder/types'
import type { ResumeTemplateId } from '@/lib/resume-builder/templates'
import { resolveTemplateId } from '@/lib/resume-builder/templates'
import { calculateATS } from '@/lib/resume-builder/ats-score'
import {
  previewSectionForScreen,
  stepIndexForScreen,
  validateScreen,
  WIZARD_SCREENS,
  WIZARD_STEPS,
  type WizardStepId,
} from '@/lib/resume-builder/wizard-steps'
import { WizardStepper } from '@/components/resume-builder/wizard/WizardStepper'
import { WizardIntroScreen } from '@/components/resume-builder/wizard/WizardIntroScreen'
import { WizardFooter } from '@/components/resume-builder/wizard/WizardFooter'
import { WizardPreviewPane } from '@/components/resume-builder/wizard/WizardPreviewPane'
import { SkipExperienceModal, DownloadFormatModal } from '@/components/resume-builder/wizard/DownloadFormatModal'
import { HeaderStep } from '@/components/resume-builder/wizard/steps/HeaderStep'
import { ExperienceStep } from '@/components/resume-builder/wizard/steps/ExperienceStep'
import { EducationStep } from '@/components/resume-builder/wizard/steps/EducationStep'
import { SkillsStep } from '@/components/resume-builder/wizard/steps/SkillsStep'
import { SummaryStep } from '@/components/resume-builder/wizard/steps/SummaryStep'
import { AdditionalStep } from '@/components/resume-builder/wizard/steps/AdditionalStep'
import { FinalizeStep } from '@/components/resume-builder/wizard/steps/FinalizeStep'
import { RoastPrefillBanner } from '@/components/resume-builder/RoastPrefillBanner'
import type { PrefillStatus } from '@/components/resume-builder/useRoastPrefill'
import { TemplatePicker } from '@/components/resume-builder/TemplatePicker'
import type { StepFormProps } from '@/components/resume-builder/wizard/step-form-utils'
import './wizard.css'

type MobileTab = 'edit' | 'preview'

export type ResumeBuilderWizardProps = {
  mode: 'public' | 'dashboard'
  data: ResumeData
  onChange: (data: ResumeData) => void
  screenIndex: number
  onScreenIndexChange: (index: number) => void
  templateId: ResumeTemplateId
  onTemplateChange: (id: ResumeTemplateId) => void
  onDownload: () => void | Promise<void>
  downloading: boolean
  toolbar?: ReactNode
  prefillBanner?: { status: PrefillStatus; filledCount: number }
  stepFormProps: Omit<StepFormProps, 'data' | 'onChange'>
  onValidationError?: (message: string) => void
}

export function ResumeBuilderWizard({
  mode,
  data,
  onChange,
  screenIndex,
  onScreenIndexChange,
  templateId,
  onTemplateChange,
  onDownload,
  downloading,
  toolbar,
  prefillBanner,
  stepFormProps,
  onValidationError,
}: ResumeBuilderWizardProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('edit')
  const [skipModalOpen, setSkipModalOpen] = useState(false)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [validationMsg, setValidationMsg] = useState<string | null>(null)

  const screen = WIZARD_SCREENS[screenIndex] ?? WIZARD_SCREENS[0]
  const activeStepId: WizardStepId = screen?.stepId ?? 'header'
  const activeStepIndex = stepIndexForScreen(screenIndex)
  const previewSection = previewSectionForScreen(screenIndex)
  const ats = useMemo(() => calculateATS(data), [data])

  const completedThrough = useMemo(() => {
    let max = 0
    for (let i = 0; i < screenIndex; i++) {
      const s = WIZARD_SCREENS[i]
      if (s?.type === 'form') {
        const idx = WIZARD_STEPS.findIndex((x) => x.id === s.stepId)
        if (idx >= max) max = idx
      }
    }
    return max
  }, [screenIndex])

  const formProps: StepFormProps = { ...stepFormProps, data, onChange }

  const goNext = useCallback(() => {
    const result = validateScreen(screenIndex, data)
    if (!result.ok) {
      if (result.skipPrompt) {
        setSkipModalOpen(true)
        return
      }
      setValidationMsg(result.message ?? 'Please complete required fields.')
      onValidationError?.(result.message ?? '')
      return
    }
    setValidationMsg(null)
    if (screenIndex < WIZARD_SCREENS.length - 1) {
      onScreenIndexChange(screenIndex + 1)
    }
  }, [screenIndex, data, onScreenIndexChange, onValidationError])

  const goBack = useCallback(() => {
    setValidationMsg(null)
    if (screenIndex > 0) onScreenIndexChange(screenIndex - 1)
  }, [screenIndex, onScreenIndexChange])

  const jumpToFinalize = useCallback(() => {
    const idx = WIZARD_SCREENS.findIndex((s) => s.type === 'form' && s.stepId === 'finalize')
    if (idx >= 0) onScreenIndexChange(idx)
  }, [onScreenIndexChange])

  const handleDownload = useCallback(async () => {
    setDownloadModalOpen(false)
    await onDownload()
  }, [onDownload])

  const renderForm = () => {
    switch (activeStepId) {
      case 'header':
        return (
          <>
            {prefillBanner && (
              <RoastPrefillBanner
                status={prefillBanner.status}
                filledCount={prefillBanner.filledCount}
                variant="light"
              />
            )}
            <HeaderStep {...formProps} />
          </>
        )
      case 'experience':
        return <ExperienceStep {...formProps} />
      case 'education':
        return <EducationStep {...formProps} />
      case 'skills':
        return <SkillsStep {...formProps} />
      case 'summary':
        return <SummaryStep {...formProps} />
      case 'additional':
        return <AdditionalStep {...formProps} />
      case 'finalize':
        return (
          <FinalizeStep
            ats={ats}
            templateId={templateId}
            onTemplateChange={onTemplateChange}
            onDownload={() => setDownloadModalOpen(true)}
            downloading={downloading}
          />
        )
      default:
        return null
    }
  }

  const isLastScreen = screenIndex >= WIZARD_SCREENS.length - 1
  const continueLabel = isLastScreen ? 'Done' : 'Continue'

  return (
    <div className={`rb-wizard rb-wizard--${mode}`}>
      <div className="rb-wizard__toolbar">
        <TemplatePicker value={templateId} onChange={onTemplateChange} variant="toolbar" />
        {toolbar && <div className="rb-wizard__toolbar-extra">{toolbar}</div>}
      </div>

      <div className="rb-wizard__mobile-tabs">
        <button
          type="button"
          className={`rb-wizard__mobile-tab${mobileTab === 'edit' ? ' rb-wizard__mobile-tab--active' : ''}`}
          onClick={() => setMobileTab('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={`rb-wizard__mobile-tab${mobileTab === 'preview' ? ' rb-wizard__mobile-tab--active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="rb-wizard__body">
        <WizardStepper activeStepId={activeStepId} completedThrough={completedThrough} />

        <section
          className={`rb-wizard__main${mobileTab === 'preview' ? ' rb-wizard__main--hidden-mobile' : ''}`}
        >
          <div className="rb-wizard__main-scroll">
            {screen?.type === 'intro' ? (
              <WizardIntroScreen stepId={activeStepId} />
            ) : (
              renderForm()
            )}
            {validationMsg && (
              <p role="alert" style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
                {validationMsg}
              </p>
            )}
          </div>
          <WizardFooter
            canBack={screenIndex > 0}
            onBack={goBack}
            onContinue={
              isLastScreen
                ? () => setDownloadModalOpen(true)
                : goNext
            }
            continueLabel={activeStepId === 'finalize' ? 'Download PDF' : continueLabel}
            showTips={activeStepIndex >= 4 && activeStepId !== 'finalize'}
            onTips={jumpToFinalize}
          />
        </section>

        <div className={`rb-wizard__preview${mobileTab === 'preview' ? ' rb-wizard__preview--visible' : ''}`}>
          <WizardPreviewPane
            data={data}
            templateId={resolveTemplateId(templateId)}
            onTemplateChange={onTemplateChange}
            highlightSection={previewSection}
            ats={ats}
          />
        </div>
      </div>

      <SkipExperienceModal
        open={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        onAdd={() => setSkipModalOpen(false)}
        onSkip={() => {
          setSkipModalOpen(false)
          onScreenIndexChange(screenIndex + 1)
        }}
      />

      <DownloadFormatModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </div>
  )
}
