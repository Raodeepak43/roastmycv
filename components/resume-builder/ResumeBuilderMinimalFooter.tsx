'use client'

import Link from 'next/link'

export function ResumeBuilderMinimalFooter() {
  return (
    <footer className="shrink-0 border-t border-[#1A1A1A] bg-[#0A0A0A] px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 font-body text-[11px] text-dim">
        <span>© {new Date().getFullYear()} MyCVRoast · 1 free PDF export</span>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/" className="hover:text-[var(--color-ember)] transition-colors">
            Roast CV
          </Link>
          <Link href="/blog" className="hover:text-[var(--color-ember)] transition-colors">
            Blog
          </Link>
          <Link href="/login?from=%2Fdashboard%2Fresume-builder" className="hover:text-[var(--color-ember)] transition-colors">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  )
}
