'use client'

import { patchData, WIZARD_FORM, type StepFormProps } from '@/components/resume-builder/wizard/step-form-utils'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'

export function HeaderStep({ data, onChange }: StepFormProps) {
  const copy = formTitleFor('header')
  const patch = (partial: Parameters<typeof patchData>[2]) => patchData(data, onChange, partial)

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className={`${WIZARD_FORM.card} grid gap-3 sm:grid-cols-2`}>
        <div className="sm:col-span-2">
          <label className={WIZARD_FORM.label}>Full Name</label>
          <input
            className={WIZARD_FORM.input}
            value={data.personal.fullName}
            onChange={(e) => patch({ personal: { ...data.personal, fullName: e.target.value } })}
            placeholder="Your full name"
            autoComplete="off"
            name="mcr-resume-full-name"
            spellCheck={false}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={WIZARD_FORM.label}>Job Title</label>
          <input
            className={WIZARD_FORM.input}
            value={data.personal.jobTitle}
            onChange={(e) => patch({ personal: { ...data.personal, jobTitle: e.target.value } })}
            placeholder="Software Development Engineer"
          />
        </div>
        <div>
          <label className={WIZARD_FORM.label}>Email</label>
          <input
            className={WIZARD_FORM.input}
            type="email"
            value={data.personal.email}
            onChange={(e) => patch({ personal: { ...data.personal, email: e.target.value } })}
          />
        </div>
        <div>
          <label className={WIZARD_FORM.label}>Phone</label>
          <input
            className={WIZARD_FORM.input}
            value={data.personal.phone}
            onChange={(e) => patch({ personal: { ...data.personal, phone: e.target.value } })}
          />
        </div>
        <div>
          <label className={WIZARD_FORM.label}>City / Location</label>
          <input
            className={WIZARD_FORM.input}
            value={data.personal.location}
            onChange={(e) => patch({ personal: { ...data.personal, location: e.target.value } })}
            placeholder="Bangalore, India"
          />
        </div>
        <div>
          <label className={WIZARD_FORM.label}>LinkedIn URL</label>
          <input
            className={WIZARD_FORM.input}
            value={data.personal.linkedin}
            onChange={(e) => patch({ personal: { ...data.personal, linkedin: e.target.value } })}
            placeholder="linkedin.com/in/you"
          />
        </div>
      </div>
    </div>
  )
}
