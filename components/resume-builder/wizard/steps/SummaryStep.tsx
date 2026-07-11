'use client'

import { AiButton, patchData, useStepAi, WIZARD_FORM, type StepFormProps } from '@/components/resume-builder/wizard/step-form-utils'
import { formTitleFor } from '@/lib/resume-builder/wizard-steps'
import { SUMMARY_PRESETS } from '@/lib/resume-builder/summary-presets'

export function SummaryStep(props: StepFormProps) {
  const { data, onChange } = props
  const copy = formTitleFor('summary')
  const patch = (partial: Parameters<typeof patchData>[2]) => patchData(data, onChange, partial)
  const { loadingKey, aiDepleted, aiUpgradeHref, runAi } = useStepAi(props)

  return (
    <div>
      <div className="rb-wizard__form-head">
        <h2 className="rb-wizard__form-title">{copy.title}</h2>
        <p className="rb-wizard__form-sub">{copy.subtitle}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className={WIZARD_FORM.label} style={{ marginBottom: '0.5rem' }}>
            Prewritten options
          </p>
          {SUMMARY_PRESETS.map((preset) => (
            <div key={preset.id} className="rb-wiz-preset">
              <p>{preset.text}</p>
              <button
                type="button"
                className="rb-wiz-preset-add"
                onClick={() => patch({ summary: preset.text })}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
        <div className={WIZARD_FORM.card}>
          <label className={WIZARD_FORM.label}>Your summary</label>
          <textarea
            className={`${WIZARD_FORM.input} resize-y min-h-[140px]`}
            rows={6}
            value={data.summary}
            onChange={(e) => patch({ summary: e.target.value })}
            placeholder="2–3 sentences about your experience and impact…"
          />
          <AiButton
            label="Enhance with AI"
            loading={loadingKey === 'summary'}
            disabled={aiDepleted}
            upgradeHref={aiUpgradeHref}
            onClick={() =>
              runAi('summary', data.summary, 'summary', (r) => patch({ summary: r }))
            }
          />
        </div>
      </div>
    </div>
  )
}
