'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { patchData, WIZARD_FORM, type StepFormProps } from '@/components/resume-builder/wizard/step-form-utils'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'
import { appendSkillToField, filterSkillSuggestions } from '@/lib/resume-builder/skill-suggestions'

export function SkillsStep({ data, onChange }: StepFormProps) {
  const copy = formTitleFor('skills')
  const patch = (partial: Parameters<typeof patchData>[2]) => patchData(data, onChange, partial)
  const [query, setQuery] = useState('')
  const suggestions = useMemo(() => filterSkillSuggestions(query), [query])

  const addSkill = (skill: string, field: keyof typeof data.skills) => {
    patch({
      skills: {
        ...data.skills,
        [field]: appendSkillToField(data.skills[field], skill),
      },
    })
  }

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className={WIZARD_FORM.card}>
        <label className={WIZARD_FORM.label}>Search skills</label>
        <input
          className={WIZARD_FORM.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by skill or tool"
        />
        <div className="rb-wiz-skill-pills" style={{ marginTop: '0.75rem' }}>
          {suggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              className="rb-wiz-skill-pill"
              onClick={() => addSkill(skill, 'tools')}
            >
              <Plus size={12} aria-hidden />
              {skill}
            </button>
          ))}
        </div>
        <div className="grid gap-3" style={{ marginTop: '1rem' }}>
          {(
            [
              ['languages', 'Languages'],
              ['frameworks', 'Frameworks'],
              ['tools', 'Tools / Cloud'],
              ['databases', 'Databases'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={WIZARD_FORM.label}>{label}</label>
              <input
                className={WIZARD_FORM.input}
                value={data.skills[key]}
                onChange={(e) =>
                  patch({ skills: { ...data.skills, [key]: e.target.value } })
                }
                placeholder="Comma-separated"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
