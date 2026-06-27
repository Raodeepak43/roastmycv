import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { getUi } from '@/app/i18n'

export function BlogHeader() {
  return (
    <header className="w-full border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-lg md:text-xl text-white hover:text-orange transition-colors">
          🔥 MyCVRoast
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/blog" className="font-body text-[13px] text-orange">
            Blog
          </Link>
          <Link
            href="/"
            className="font-body text-[11px] text-white border border-border px-2.5 py-1 rounded-full hover:border-orange hover:text-orange transition-colors"
          >
            🔥 Roast Free
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function BlogFooter() {
  const { support } = getUi('english')
  return (
    <SiteFooter
      tagline="No account needed · Made with ❤️ by an Indian"
      support={support}
      cinematic={false}
    />
  )
}

export function BlogBreadcrumb({ title }: { title: string }) {
  return (
    <nav className="font-body text-[12px] mb-6 flex items-center flex-wrap gap-y-1" aria-label="Breadcrumb">
      <Link href="/" className="text-orange hover:underline">Home</Link>
      <span className="text-[#444444] mx-2">&gt;</span>
      <Link href="/blog" className="text-orange hover:underline">Blog</Link>
      <span className="text-[#444444] mx-2">&gt;</span>
      <span className="text-[#666666] truncate max-w-[200px] sm:max-w-none">{title}</span>
    </nav>
  )
}

export function BlogCta() {
  return (
    <div
      className="mt-10 text-center rounded-2xl p-8 border-2 border-orange"
      style={{ background: '#0F0F0F' }}
    >
      <p className="text-5xl mb-4">🔥</p>
      <p className="font-display text-xl md:text-2xl text-white mb-6">
        Apna resume roast karwao — free mein
      </p>
      <Link href="/" className="btn-roast inline-block px-10 py-3.5 text-lg">
        Roast Karo →
      </Link>
    </div>
  )
}
