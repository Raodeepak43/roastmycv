'use client'

import { CheckCircle2, Download } from 'lucide-react'
import type { AtsResult } from '@/lib/resume-builder/ats-score'
import type { ResumeTemplateId } from '@/lib/resume-builder/templates'
import { AtsScorePanel } from '@/components/resume-builder/AtsScorePanel'
import { TemplatePicker } from '@/components/resume-builder/TemplatePicker'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'

export function FinalizeStep({
  ats,
  templateId,
  onTemplateChange,
  onDownload,
  downloading,
}: {
  ats: AtsResult
  templateId: ResumeTemplateId
  onTemplateChange: (id: ResumeTemplateId) => void
  onDownload: () => void
  downloading: boolean
}) {
  const copy = formTitleFor('finalize')

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className="rb-wizard__finalize-grid">
        <AtsScorePanel ats={ats} theme="light" layout="compact" />
        <div className="rb-wiz-card">
          <p className="rb-wiz-label" style={{ marginBottom: '0.75rem' }}>
            ATS checklist
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ats.missing.length === 0 ? (
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: '#059669' }}>
                <CheckCircle2 size={16} className="shrink-0" aria-hidden />
                Your resume looks ATS-ready!
              </li>
            ) : (
              ats.missing.map((item) => (
                <li key={item} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                  <span style={{ color: '#ff4500' }}>→</span>
                  {item}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rb-wiz-card rb-wiz-card--full">
          <TemplatePicker value={templateId} onChange={onTemplateChange} variant="gallery" />
        </div>
        <button
          type="button"
          className="rb-wizard__continue"
          style={{ display: 'inline-flex', gap: '0.5rem', alignSelf: 'flex-start' }}
          onClick={onDownload}
          disabled={downloading}
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          {downloading ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}
