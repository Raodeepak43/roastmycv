'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminHeader({ title, description }: { title: string; description?: string }) {
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="admin-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="admin-header-actions">
        <button type="button" className="admin-btn-sm" onClick={logout}>
          <LogOut size={14} aria-hidden />
          Logout
        </button>
      </div>
    </header>
  )
}
