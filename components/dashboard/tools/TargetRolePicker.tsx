'use client'

import { useMemo, useState } from 'react'
import {
  POPULAR_TARGET_ROLES,
  TARGET_ROLE_CATEGORIES,
  type TargetRoleCategory,
} from '@/lib/tools/dashboard/target-roles'

type Props = {
  value: string
  onChange: (value: string) => void
  label?: string
  hint?: string
  placeholder?: string
  inputId?: string
}

export function TargetRolePicker({
  value,
  onChange,
  label = 'What role are you interviewing for?',
  hint = 'Pick a suggestion or type your own — we tailor questions to your CV and this role.',
  placeholder = 'e.g. Software Engineer, Data Analyst',
  inputId = 'target-role',
}: Props) {
  const [categoryId, setCategoryId] = useState<string>(TARGET_ROLE_CATEGORIES[0]?.id ?? 'tech')

  const activeCategory = useMemo<TargetRoleCategory | undefined>(
    () => TARGET_ROLE_CATEGORIES.find((c) => c.id === categoryId),
    [categoryId],
  )

  const normalizedValue = value.trim().toLowerCase()

  return (
    <div className="dash-target-role">
      <label className="dash-tools-label" htmlFor={inputId}>
        {label}
      </label>
      {hint ? <p className="dash-target-role__hint">{hint}</p> : null}

      <input
        id={inputId}
        className="dash-tools-input mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="organization-title"
      />

      <div className="dash-target-role__section">
        <span className="dash-target-role__label">Popular picks</span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TARGET_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className={`dash-tools-chip ${normalizedValue === role.toLowerCase() ? 'dash-tools-chip--active' : ''}`}
              onClick={() => onChange(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-target-role__section">
        <span className="dash-target-role__label">Browse by category</span>
        <div className="flex flex-wrap gap-2">
          {TARGET_ROLE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`dash-tools-chip dash-target-role__cat ${categoryId === cat.id ? 'dash-tools-chip--active' : ''}`}
              onClick={() => setCategoryId(cat.id)}
              title={cat.hint}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {activeCategory ? (
          <>
            <p className="dash-target-role__cat-hint">{activeCategory.hint}</p>
            <div className="flex flex-wrap gap-2">
              {activeCategory.roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`dash-tools-chip ${normalizedValue === role.toLowerCase() ? 'dash-tools-chip--active' : ''}`}
                  onClick={() => onChange(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
