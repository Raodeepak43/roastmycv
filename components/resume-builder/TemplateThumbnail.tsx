'use client'

import { ResumePreview } from '@/components/resume-builder/ResumePreview'
import { SAMPLE_RESUME_DATA } from '@/lib/resume-builder/sample-resume-data'
import type { ResumeTemplateId } from '@/lib/resume-builder/templates'

interface Props {
  templateId: ResumeTemplateId
  className?: string
}

export function TemplateThumbnail({ templateId, className = '' }: Props) {
  return (
    <div className={`rb-template-thumb${className ? ` ${className}` : ''}`} aria-hidden>
      <div className="rb-template-thumb__frame">
        <div className="rb-template-thumb__paper">
          <ResumePreview
            data={SAMPLE_RESUME_DATA}
            templateId={templateId}
            exportId={false}
            interactive={false}
          />
        </div>
      </div>
    </div>
  )
}
