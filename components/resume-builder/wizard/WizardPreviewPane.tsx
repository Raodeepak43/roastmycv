'use client'

import { Sparkles } from 'lucide-react'
import type { AtsResult } from '@/lib/resume-builder/ats-score'
import type { ResumeData } from '@/lib/resume-builder/types'
import type { ResumeTemplateId } from '@/lib/resume-builder/templates'
import type { PreviewSection } from '@/lib/resume-builder/wizard-steps'
import { ResumePreview } from '@/components/resume-builder/ResumePreview'
import { TemplatePicker } from '@/components/resume-builder/TemplatePicker'

export function WizardPreviewPane({
  data,
  templateId,
  onTemplateChange,
  highlightSection,
  ats,
}: {
  data: ResumeData
  templateId: ResumeTemplateId
  onTemplateChange: (id: ResumeTemplateId) => void
  highlightSection: PreviewSection
  ats: AtsResult
}) {
  return (
    <>
      <div className="rb-wizard__preview-head">
        <p className="rb-wizard__preview-title">Live preview</p>
        <span
          className="rb-wizard__preview-score"
          style={{ color: ats.color, backgroundColor: `${ats.color}14`, borderColor: `${ats.color}33` }}
        >
          <Sparkles size={10} strokeWidth={2} aria-hidden />
          ATS {ats.score}/100
        </span>
      </div>
      <div className="rb-wizard__preview-frame">
        <div className="rb-wizard__preview-paper">
          <ResumePreview data={data} templateId={templateId} highlightSection={highlightSection} />
        </div>
      </div>
      <div className="rb-wizard__preview-templates">
        <TemplatePicker value={templateId} onChange={onTemplateChange} variant="panel" />
      </div>
    </>
  )
}
