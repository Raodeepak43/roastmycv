'use client'

import { Check, LayoutTemplate } from 'lucide-react'
import {
  RESUME_TEMPLATES,
  type ResumeTemplateId,
} from '@/lib/resume-builder/templates'

interface Props {
  value: ResumeTemplateId
  onChange: (id: ResumeTemplateId) => void
  variant?: 'toolbar' | 'panel'
}

const SWATCH: Record<ResumeTemplateId, string> = {
  classic: 'linear-gradient(135deg, #fff 60%, #ff4500 60%)',
  modern: 'linear-gradient(180deg, #2563eb 28%, #fff 28%)',
  minimal: 'linear-gradient(90deg, #111 4px, #fff 4px)',
  professional: 'linear-gradient(180deg, #1e3a5f 6px, #fff 6px)',
}

export function TemplatePicker({ value, onChange, variant = 'toolbar' }: Props) {
  if (variant === 'panel') {
    return (
      <div className="rb-wizard__templates-panel">
        <div className="rb-wizard__templates-panel-head">
          <LayoutTemplate size={16} strokeWidth={2} aria-hidden />
          <div>
            <p className="rb-wizard__templates-panel-label">ATS templates</p>
            <p className="rb-wizard__templates-panel-hint">All free · single column · PDF-ready</p>
          </div>
        </div>
        <div className="rb-wizard__templates-panel-grid">
          {RESUME_TEMPLATES.map((tpl) => {
            const selected = tpl.id === value
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange(tpl.id)}
                className={`rb-wizard__template-card${selected ? ' rb-wizard__template-card--active' : ''}`}
                aria-pressed={selected}
              >
                <span
                  className="rb-wizard__template-card-swatch"
                  style={{ background: SWATCH[tpl.id] }}
                  aria-hidden
                />
                <span className="rb-wizard__template-card-body">
                  <span className="rb-wizard__template-card-name">{tpl.name}</span>
                  <span className="rb-wizard__template-card-desc">{tpl.description}</span>
                  <span className="rb-wizard__template-card-tags">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="rb-wizard__template-card-tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
                {selected && (
                  <span className="rb-wizard__template-card-check" aria-hidden>
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

  return (
    <div className="rb-wizard__template-bar">
      <span className="rb-wizard__template-bar-label">
        <LayoutTemplate size={14} strokeWidth={2} aria-hidden />
        Template
      </span>
      <div className="rb-wizard__template-pills" role="tablist" aria-label="Resume template">
        {RESUME_TEMPLATES.map((tpl) => {
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
              <span
                className="rb-wizard__template-pill-dot"
                style={{ background: SWATCH[tpl.id] }}
                aria-hidden
              />
              {tpl.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
