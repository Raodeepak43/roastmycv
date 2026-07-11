'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { dashboardHref } from '@/lib/dashboard/paths'

type DashboardLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

/** Dashboard route link — uses clean subdomain paths in production (`/roast` not `/dashboard/roast`). */
export function DashboardLink({ href, ...rest }: DashboardLinkProps) {
  return <Link href={dashboardHref(href)} {...rest} />
}
