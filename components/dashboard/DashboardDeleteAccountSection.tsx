'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { ACCOUNT_DELETED_TOAST_KEY } from '@/lib/dashboard/constants'
import { clearUserSiteStorage } from '@/lib/client-storage/cleanup'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'

export function DashboardDeleteAccountSection() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const canConfirmDelete = confirmText === 'DELETE' && !deleting

  const handleDeleteAccount = async () => {
    if (!canConfirmDelete) return

    setDeleting(true)
    setDeleteError('')

    try {
      const res = await fetch('/api/dashboard/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete account')

      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})
      clearUserSiteStorage()
      sessionStorage.setItem(ACCOUNT_DELETED_TOAST_KEY, '1')
      setModalOpen(false)
      router.push('/')
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="dash-card border-red-200">
        <div className="dash-card-header flex items-center gap-2 border-red-100 bg-red-50/80">
          <AlertTriangle className="size-4 text-red-600" aria-hidden />
          <p className="text-sm font-semibold text-red-700">Danger zone</p>
        </div>
        <div className="dash-card-body space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Delete account</h3>
            <p className="mt-1 text-sm text-gray-600">
              Permanently delete your account and all roast history. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmText('')
              setDeleteError('')
              setModalOpen(true)
            }}
            className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Delete my account
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => !deleting && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-account-title" className="text-lg font-semibold text-gray-900">
              Delete your account?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This permanently removes your account, saved roasts, and usage data from MyCVRoast.
            </p>
            <p className="mt-4 text-sm font-medium text-gray-800">
              Type <span className="font-mono text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              autoFocus
              disabled={deleting}
              aria-label="Type DELETE to confirm"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 disabled:opacity-60"
            />
            {deleteError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteAccount()}
                disabled={!canConfirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              Questions?{' '}
              <a href={SUPPORT_MAILTO} className="text-[#ff4500] hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
