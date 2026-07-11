'use client'

import { usePathname } from 'next/navigation'
import { normalizeDashboardPathname } from '@/lib/dashboard/paths'

export function useDashboardPathname(): string {
  const pathname = usePathname()
  return normalizeDashboardPathname(pathname ?? '/dashboard')
}
