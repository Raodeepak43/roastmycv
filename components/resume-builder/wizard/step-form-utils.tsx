'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ResumeData } from '@/lib/resume-builder/types'
import { canUseAi, incrementAiUses } from '@/lib/resume-builder/usage'

export const WIZARD_FORM = {
  input: 'rb-wiz-input',
  label: 'rb-wiz-label',
  card: 'rb-wiz-card',
  title: 'rb-wiz-form-title',
  subtitle: 'rb-wiz-form-sub',
  aiBtn: 'rb-wiz-ai-btn',
  addBtn: 'rb-wiz-add-btn',
  divider: 'rb-wiz-divider',
} as const

type StrengthenType = 'bullet' | 'summary' | 'project'

async function strengthen(text: string, type: StrengthenType): Promise<string> {
  const res = await fetch('/api/strengthen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed')
  return json.result as string
}

export function AiButton({
  onClick,
  loading,
  label = 'Enhance with AI',
  disabled,
  upgradeHref,
}: {
  onClick?: () => void
  loading: boolean
  label?: string
  disabled?: boolean
  upgradeHref?: string
}) {
  if (disabled && upgradeHref) {
    return (
      <Link href={upgradeHref} className={WIZARD_FORM.aiBtn}>
        Upgrade for more AI uses
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={WIZARD_FORM.aiBtn}
    >
      {loading ? 'Working…' : label}
    </button>
  )
}

export function useStepAi(options: {
  onUpgrade: () => void
  onAiUsed?: () => void
  checkCanUseAi?: () => boolean
  onAiConsumed?: () => void
  aiUpgradeHref?: string
}) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const aiDepleted = Boolean(options.checkCanUseAi && !options.checkCanUseAi())

  const runAi = async (
    key: string,
    text: string,
    type: StrengthenType,
    apply: (result: string) => void,
  ) => {
    if (!text.trim()) return
    const allowed = options.checkCanUseAi ? options.checkCanUseAi() : canUseAi()
    if (!allowed) {
      options.onUpgrade()
      return
    }
    setLoadingKey(key)
    try {
      const result = await strengthen(text, type)
      if (options.onAiConsumed) options.onAiConsumed()
      else incrementAiUses()
      options.onAiUsed?.()
      apply(result)
    } catch {
      /* ignore */
    } finally {
      setLoadingKey(null)
    }
  }

  return {
    loadingKey,
    aiDepleted,
    aiUpgradeHref: options.checkCanUseAi ? options.aiUpgradeHref : undefined,
    runAi,
  }
}

export type StepFormProps = {
  data: ResumeData
  onChange: (data: ResumeData) => void
  onUpgrade: () => void
  onAiUsed?: () => void
  checkCanUseAi?: () => boolean
  onAiConsumed?: () => void
  aiUpgradeHref?: string
}

export function patchData(data: ResumeData, onChange: (d: ResumeData) => void, partial: Partial<ResumeData>) {
  onChange({ ...data, ...partial })
}
