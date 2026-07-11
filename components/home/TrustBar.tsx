import Link from 'next/link'
import { NumberTicker } from '@/components/ui/be-ui-number-animation'

const PRODUCT_HUNT_URL = 'https://www.producthunt.com/products/mycvroast'

type TrustBarProps = {
  roastCount: number
  statsLoading?: boolean
  roastLabel?: string
}

function StatCell({
  icon,
  title,
  subtitle,
  loading,
  animatedValue,
}: {
  icon: string
  title: React.ReactNode
  subtitle: string
  loading?: boolean
  animatedValue?: number
}) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-3 text-center sm:px-4 sm:py-4">
      <span className="text-base sm:text-lg mb-1.5" aria-hidden>
        {icon}
      </span>
      <p className="font-display text-sm sm:text-base text-text-dark leading-tight">
        {loading ? (
          <span className="inline-block skeleton h-4 w-12 mx-auto" />
        ) : animatedValue !== undefined ? (
          <NumberTicker
            value={animatedValue}
            startOnView={false}
            blur
            duration={0.85}
            format={(n) => n.toLocaleString('en-US')}
            className="text-orange tabular-nums"
          />
        ) : (
          title
        )}
      </p>
      <p className="mt-1 font-body text-[10px] sm:text-[11px] text-muted leading-snug">{subtitle}</p>
    </div>
  )
}

function ProductHuntBadge() {
  return (
    <Link
      href={PRODUCT_HUNT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#da552f]/40 bg-[#da552f]/10 px-2.5 py-1 font-body text-[11px] font-semibold text-[#ff6154] transition-colors hover:border-[#da552f]/70 hover:bg-[#da552f]/20"
      aria-label="MyCVRoast on Product Hunt — open launch page"
    >
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.604 8.4h-3.72V12h3.72a1.8 1.8 0 100-3.6zm0 7.2h-3.72v3.6h3.72a1.8 1.8 0 100-3.6zM7.884 4.8H2.604A1.8 1.8 0 001 6.6v10.8a1.8 1.8 0 001.8 1.8h5.28V4.8z" />
      </svg>
      Product Hunt
    </Link>
  )
}

export function TrustBar({
  roastCount,
  statsLoading = false,
  roastLabel = 'resumes roasted',
}: TrustBarProps) {
  return (
    <div
      className="mb-8 rounded-[2rem] border border-black/10 bg-white overflow-hidden shadow-sm"
      aria-label="Trust and product highlights"
    >
      <div className="grid grid-cols-3 divide-x divide-black/[0.06]">
        <StatCell icon="🔓" title="Free" subtitle="No signup needed" />
        <StatCell icon="🌍" title="15 langs" subtitle="Hinglish included" />
        <StatCell
          icon="🔥"
          title={null}
          subtitle={roastLabel}
          loading={statsLoading}
          animatedValue={statsLoading ? undefined : roastCount}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-black/[0.08] bg-bg-beige/60 px-4 py-2.5">
        <span className="font-body text-[10px] uppercase tracking-[0.14em] text-muted">As seen on</span>
        <ProductHuntBadge />
      </div>
    </div>
  )
}
