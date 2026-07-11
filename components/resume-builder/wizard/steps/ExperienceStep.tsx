'use client'

import { AiButton, patchData, useStepAi, WIZARD_FORM, type StepFormProps } from '@/components/resume-builder/wizard/step-form-utils'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'
import { createExperience } from '@/lib/resume-builder/types'

export function ExperienceStep(props: StepFormProps) {
  const { data, onChange } = props
  const copy = formTitleFor('experience')
  const patch = (partial: Parameters<typeof patchData>[2]) => patchData(data, onChange, partial)
  const { loadingKey, aiDepleted, aiUpgradeHref, runAi } = useStepAi(props)

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className={WIZARD_FORM.card}>
        {data.experience.map((job, jobIdx) => (
          <div key={job.id} className={WIZARD_FORM.divider}>
            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <div>
                <label className={WIZARD_FORM.label}>Job Title</label>
                <input
                  className={WIZARD_FORM.input}
                  value={job.jobTitle}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    experience[jobIdx] = { ...job, jobTitle: e.target.value }
                    patch({ experience })
                  }}
                />
              </div>
              <div>
                <label className={WIZARD_FORM.label}>Employer</label>
                <input
                  className={WIZARD_FORM.input}
                  value={job.company}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    experience[jobIdx] = { ...job, company: e.target.value }
                    patch({ experience })
                  }}
                />
              </div>
              <div>
                <label className={WIZARD_FORM.label}>City</label>
                <input
                  className={WIZARD_FORM.input}
                  value={job.location}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    experience[jobIdx] = { ...job, location: e.target.value }
                    patch({ experience })
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={WIZARD_FORM.label}>Start</label>
                  <input
                    className={WIZARD_FORM.input}
                    value={job.startDate}
                    placeholder="Jan 2022"
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[jobIdx] = { ...job, startDate: e.target.value }
                      patch({ experience })
                    }}
                  />
                </div>
                <div>
                  <label className={WIZARD_FORM.label}>End</label>
                  <input
                    className={WIZARD_FORM.input}
                    value={job.endDate}
                    placeholder="Present"
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[jobIdx] = { ...job, endDate: e.target.value }
                      patch({ experience })
                    }}
                  />
                </div>
              </div>
            </div>
            {job.bullets.map((bullet, bIdx) => (
              <div key={bIdx} className="mb-3">
                <label className={WIZARD_FORM.label}>Bullet {bIdx + 1}</label>
                <textarea
                  className={`${WIZARD_FORM.input} resize-y min-h-[56px]`}
                  rows={2}
                  value={bullet}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    const bullets = [...job.bullets]
                    bullets[bIdx] = e.target.value
                    experience[jobIdx] = { ...job, bullets }
                    patch({ experience })
                  }}
                />
                <AiButton
                  label="Enhance with AI"
                  loading={loadingKey === `b-${jobIdx}-${bIdx}`}
                  disabled={aiDepleted}
                  upgradeHref={aiUpgradeHref}
                  onClick={() =>
                    runAi(`b-${jobIdx}-${bIdx}`, bullet, 'bullet', (r) => {
                      const experience = [...data.experience]
                      const bullets = [...job.bullets]
                      bullets[bIdx] = r
                      experience[jobIdx] = { ...job, bullets }
                      patch({ experience })
                    })
                  }
                />
              </div>
            ))}
            {job.bullets.length < 5 && (
              <button
                type="button"
                className={WIZARD_FORM.aiBtn}
                style={{ marginTop: 0 }}
                onClick={() => {
                  const experience = [...data.experience]
                  experience[jobIdx] = { ...job, bullets: [...job.bullets, ''] }
                  patch({ experience })
                }}
              >
                + Add bullet
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className={WIZARD_FORM.addBtn}
          onClick={() => patch({ experience: [...data.experience, createExperience()] })}
        >
          + Add another job
        </button>
      </div>
    </div>
  )
}
