'use client'

import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'

interface PublicResumeBuilderHeaderProps {
  pdfLeft: number
}

export function PublicResumeBuilderHeader({ pdfLeft }: PublicResumeBuilderHeaderProps) {
  const depleted = pdfLeft <= 0
  const tooltip = depleted
    ? 'No free PDF exports left — sign in for more'
    : `${pdfLeft} PDF export${pdfLeft === 1 ? '' : 's'} left this month`

  const label = depleted ? (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[#ff4500]">0 PDF exports</span>
      <Link
        href="/login?next=%2Fdashboard%2Fresume-builder"
        className="text-[10px] font-semibold text-[#ff4500] underline underline-offset-2 hover:text-white"
      >
        Upgrade
      </Link>
    </span>
  ) : (
    `${pdfLeft} PDF export${pdfLeft === 1 ? '' : 's'}`
  )

  return (
    <SiteHeader
      activePath="resume-builder"
      breadcrumb="Resume Builder"
      badge={{ label, accent: !depleted && pdfLeft > 0, title: tooltip }}
    />
  )
}
