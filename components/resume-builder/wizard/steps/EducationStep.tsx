'use client'

import { patchData, WIZARD_FORM, type StepFormProps } from '@/components/resume-builder/wizard/step-form-utils'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'

export function EducationStep({ data, onChange }: StepFormProps) {
  const copy = formTitleFor('education')
  const patch = (partial: Parameters<typeof patchData>[2]) => patchData(data, onChange, partial)

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className={`${WIZARD_FORM.card} grid gap-3 sm:grid-cols-2`}>
        <div className="sm:col-span-2">
          <label className={WIZARD_FORM.label}>Degree</label>
          <input
            className={WIZARD_FORM.input}
            value={data.education.degree}
            onChange={(e) => patch({ education: { ...data.education, degree: e.target.value } })}
            placeholder="B.Tech Computer Science"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={WIZARD_FORM.label}>School / University</label>
          <input
            className={WIZARD_FORM.input}
            value={data.education.university}
            onChange={(e) => patch({ education: { ...data.education, university: e.target.value } })}
          />
        </div>
        <div>
          <label className={WIZARD_FORM.label}>Graduation Year</label>
          <input
            className={WIZARD_FORM.input}
            value={data.education.gradYear}
            onChange={(e) => patch({ education: { ...data.education, gradYear: e.target.value } })}
          />
        </div>
        <div>
          <label className={WIZARD_FORM.label}>GPA (optional)</label>
          <input
            className={WIZARD_FORM.input}
            value={data.education.gpa}
            onChange={(e) => patch({ education: { ...data.education, gpa: e.target.value } })}
          />
        </div>
      </div>
    </div>
  )
}
