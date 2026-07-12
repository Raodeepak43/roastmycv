'use client'

import { useMemo, useState } from 'react'
import { Check, LayoutTemplate } from 'lucide-react'
import { TemplateThumbnail } from '@/components/resume-builder/TemplateThumbnail'
import {
  filterTemplatesByCategory,
  TEMPLATE_CATEGORIES,
  RESUME_TEMPLATES,
  type ResumeTemplateCategory,
  type ResumeTemplateId,
} from '@/lib/resume-builder/templates'

interface Props {
  value: ResumeTemplateId
  onChange: (id: ResumeTemplateId) => void
  variant?: 'toolbar' | 'panel' | 'gallery'
}

export function TemplatePicker({ value, onChange, variant = 'toolbar' }: Props) {
  const [category, setCategory] = useState<ResumeTemplateCategory>('all')
  const templates = useMemo(() => filterTemplatesByCategory(category), [category])

  if (variant === 'gallery' || variant === 'panel') {
    return (
      <div className="rb-wizard__templates-panel">
        <div className="rb-wizard__templates-panel-head">
          <LayoutTemplate size={16} strokeWidth={2} aria-hidden />
          <div>
            <p className="rb-wizard__templates-panel-label">Choose your design</p>
            <p className="rb-wizard__templates-panel-hint">
              {RESUME_TEMPLATES.length} professional templates · all free · ATS-friendly
            </p>
          </div>
        </div>

        <div className="rb-wizard__template-filters" role="tablist" aria-label="Template category">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.id}
              className={`rb-wizard__template-filter${category === cat.id ? ' rb-wizard__template-filter--active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className={`rb-wizard__template-gallery${variant === 'gallery' ? ' rb-wizard__template-gallery--wide' : ''}`}>
          {templates.map((tpl) => {
            const selected = tpl.id === value
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange(tpl.id)}
                className={`rb-wizard__template-gallery-card${selected ? ' rb-wizard__template-gallery-card--active' : ''}`}
                aria-pressed={selected}
              >
                <TemplateThumbnail templateId={tpl.id} />
                <span className="rb-wizard__template-gallery-meta">
                  <span className="rb-wizard__template-gallery-name">{tpl.name}</span>
                  <span className="rb-wizard__template-gallery-desc">{tpl.description}</span>
                  <span className="rb-wizard__template-card-tags">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="rb-wizard__template-card-tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
                {selected && (
                  <span className="rb-wizard__template-gallery-check" aria-hidden>
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const activeMeta = RESUME_TEMPLATES.find((t) => t.id === value)

  return (
    <div className="rb-wizard__template-bar">
      <span className="rb-wizard__template-bar-label">
        <LayoutTemplate size={14} strokeWidth={2} aria-hidden />
        {activeMeta?.name ?? 'Template'}
      </span>
      <div className="rb-wizard__template-pills" role="tablist" aria-label="Resume template">
        {RESUME_TEMPLATES.slice(0, 6).map((tpl) => {
          const selected = tpl.id === value
          return (
            <button
              key={tpl.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tpl.id)}
              className={`rb-wizard__template-pill${selected ? ' rb-wizard__template-pill--active' : ''}`}
              title={tpl.description}
            >
              {tpl.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
