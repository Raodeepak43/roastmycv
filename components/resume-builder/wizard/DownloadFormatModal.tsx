'use client'

import { X } from 'lucide-react'

export function SkipExperienceModal({
  open,
  onAdd,
  onSkip,
  onClose,
}: {
  open: boolean
  onAdd: () => void
  onSkip: () => void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="rb-wizard__skip-modal" role="dialog" aria-modal="true">
      <div className="rb-wizard__skip-dialog">
        <h3>Are you sure you don&apos;t want to fill out your Experience?</h3>
        <p>
          Experience can also be internships, volunteer work, professional licenses, or unpaid jobs.
        </p>
        <div className="rb-wizard__skip-actions">
          <button type="button" className="rb-wizard__continue" onClick={onAdd}>
            Add experience
          </button>
          <button type="button" className="rb-wizard__tips-btn" onClick={onSkip}>
            No thanks, keep going
          </button>
          <button type="button" className="rb-wizard__back" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export function DownloadFormatModal({
  open,
  onClose,
  onDownload,
  downloading,
}: {
  open: boolean
  onClose: () => void
  onDownload: () => void
  downloading: boolean
}) {
  if (!open) return null

  return (
    <div className="rb-wizard__download-modal" role="dialog" aria-modal="true">
      <div className="rb-wizard__download-dialog">
        <button type="button" className="rb-wizard__download-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>What format would you like?</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#64748b' }}>
          PDF maintains format and is easiest to share with recruiters.
        </p>
        <button
          type="button"
          className="rb-wizard__continue"
          style={{ width: '100%' }}
          onClick={onDownload}
          disabled={downloading}
        >
          {downloading ? 'Generating…' : 'Download PDF — Most popular'}
        </button>
      </div>
    </div>
  )
}
