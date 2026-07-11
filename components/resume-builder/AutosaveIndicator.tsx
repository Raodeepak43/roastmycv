import { Check } from 'lucide-react'
import type { ResumeSaveStatus } from '@/components/resume-builder/useResumeAutosave'

export function AutosaveIndicator({
  status,
  theme = 'dark',
}: {
  status: ResumeSaveStatus
  theme?: 'dark' | 'light'
}) {
  const muted = theme === 'light' ? 'text-gray-400' : 'text-dim'
  const savedColor = theme === 'light' ? 'text-gray-500' : 'text-muted'

  if (status === 'saving') {
    return (
      <span className={`font-body text-[12px] ${muted}`} role="status" aria-live="polite">
        Saving…
      </span>
    )
  }

  if (status === 'unsaved') {
    return (
      <span className={`font-body text-[12px] ${muted}`} role="status" aria-live="polite">
        Unsaved changes
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-body text-[12px] ${savedColor}`}
      role="status"
      aria-live="polite"
    >
      <Check className="size-3 shrink-0" aria-hidden />
      Saved
    </span>
  )
}
