'use client'

import { useState } from 'react'
import { Award, Briefcase, Globe, Trophy } from 'lucide-react'
import {
  AiButton,
  patchData,
  useStepAi,
  WIZARD_FORM,
  type StepFormProps,
} from '@/components/resume-builder/wizard/step-form-utils'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'
import { createProject } from '@/lib/resume-builder/types'

const EXTRA_SECTIONS = [
  { id: 'achievements', label: 'Awards & Honors', icon: Trophy },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'certifications', label: 'Certifications', icon: Award },
] as const

type ExtraId = (typeof EXTRA_SECTIONS)[number]['id']

export function AdditionalStep(props: StepFormProps) {
  const { data, onChange } = props
  const copy = formTitleFor('additional')
  const patch = (partial: Parameters<typeof patchData>[2]) => patchData(data, onChange, partial)
  const { loadingKey, aiDepleted, aiUpgradeHref, runAi } = useStepAi(props)
  const [active, setActive] = useState<ExtraId[]>(['achievements', 'projects'])

  const toggle = (id: ExtraId) => {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className="rb-wiz-extra-grid">
        {EXTRA_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`rb-wiz-extra-card${active.includes(id) ? ' rb-wiz-extra-card--active' : ''}`}
            onClick={() => toggle(id)}
          >
            <Icon size={22} strokeWidth={1.75} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {active.includes('achievements') && (
        <div className={`${WIZARD_FORM.card} mb-4`}>
          <h3 className={WIZARD_FORM.label}>Achievements &amp; Awards</h3>
          {data.achievements.map((ach, aIdx) => (
            <div key={aIdx} className="mb-3">
              <input
                className={WIZARD_FORM.input}
                value={ach}
                onChange={(e) => {
                  const achievements = [...data.achievements]
                  achievements[aIdx] = e.target.value
                  patch({ achievements })
                }}
                placeholder={`Achievement ${aIdx + 1}`}
              />
            </div>
          ))}
          <button
            type="button"
            className={WIZARD_FORM.addBtn}
            onClick={() => patch({ achievements: [...data.achievements, ''] })}
          >
            + Add more
          </button>
        </div>
      )}

      {active.includes('projects') && (
        <div className={`${WIZARD_FORM.card} mb-4`}>
          <h3 className={WIZARD_FORM.label}>Key Projects</h3>
          {data.projects.map((proj, pIdx) => (
            <div key={proj.id} className={WIZARD_FORM.divider}>
              <div className="grid gap-3">
                <div>
                  <label className={WIZARD_FORM.label}>Project Name</label>
                  <input
                    className={WIZARD_FORM.input}
                    value={proj.name}
                    onChange={(e) => {
                      const projects = [...data.projects]
                      projects[pIdx] = { ...proj, name: e.target.value }
                      patch({ projects })
                    }}
                  />
                </div>
                <div>
                  <label className={WIZARD_FORM.label}>Tech Stack</label>
                  <input
                    className={WIZARD_FORM.input}
                    value={proj.techStack}
                    onChange={(e) => {
                      const projects = [...data.projects]
                      projects[pIdx] = { ...proj, techStack: e.target.value }
                      patch({ projects })
                    }}
                  />
                </div>
                <div>
                  <label className={WIZARD_FORM.label}>Description</label>
                  <textarea
                    className={`${WIZARD_FORM.input} min-h-[72px]`}
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const projects = [...data.projects]
                      projects[pIdx] = { ...proj, description: e.target.value }
                      patch({ projects })
                    }}
                  />
                  <AiButton
                    label="Enhance with AI"
                    loading={loadingKey === `p-${pIdx}`}
                    disabled={aiDepleted}
                    upgradeHref={aiUpgradeHref}
                    onClick={() =>
                      runAi(`p-${pIdx}`, proj.description, 'project', (r) => {
                        const projects = [...data.projects]
                        projects[pIdx] = { ...proj, description: r }
                        patch({ projects })
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={WIZARD_FORM.addBtn}
            onClick={() => patch({ projects: [...data.projects, createProject()] })}
          >
            + Add project
          </button>
        </div>
      )}

      {(active.includes('languages') || active.includes('certifications')) && (
        <div className={WIZARD_FORM.card}>
          <p className="rb-wizard__form-sub" style={{ margin: 0 }}>
            Add languages or certifications in Achievements (e.g. &quot;Fluent in Hindi &amp; English&quot; or
            &quot;AWS Certified Developer&quot;).
          </p>
        </div>
      )}
    </div>
  )
}
