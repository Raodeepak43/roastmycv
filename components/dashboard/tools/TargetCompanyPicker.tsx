'use client'

import { TARGET_COMPANY_SUGGESTIONS } from '@/lib/tools/dashboard/target-roles'

type Props = {
  value: string
  onChange: (value: string) => void
  label?: string
  inputId?: string
}

export function TargetCompanyPicker({
  value,
  onChange,
  label = 'Company name (optional)',
  inputId = 'target-company',
}: Props) {
  const normalizedValue = value.trim().toLowerCase()

  return (
    <div className="dash-target-role">
      <label className="dash-tools-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="dash-tools-input mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Flipkart, TCS, or leave blank"
        autoComplete="organization"
      />
      <div className="dash-target-role__section">
        <span className="dash-target-role__label">Common companies</span>
        <div className="flex flex-wrap gap-2">
          {TARGET_COMPANY_SUGGESTIONS.map((company) => (
            <button
              key={company}
              type="button"
              className={`dash-tools-chip ${normalizedValue === company.toLowerCase() ? 'dash-tools-chip--active' : ''}`}
              onClick={() => onChange(company)}
            >
              {company}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
