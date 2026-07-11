import Link from 'next/link'
import { NumberTicker } from '@/components/ui/be-ui-number-animation'

const PRODUCT_HUNT_URL = 'https://www.producthunt.com/products/mycvroast'

type HomeTrustBarProps = {
  roastCount: number
  statsLoading?: boolean
  /** e.g. "CVs destroyed" from i18n */
  roastLabel?: string
}

function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-white/[0.04] px-2.5 py-1 font-body text-[11px] text-[#ccc]">
      {children}
    </span>
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

export function HomeTrustBar({
  roastCount,
  statsLoading = false,
  roastLabel = 'CVs roasted',
}: HomeTrustBarProps) {
  return (
    <div
      className="mb-6 rounded-xl border border-border bg-black/40 px-3 py-3 md:px-4"
      aria-label="Trust and product highlights"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:gap-x-4">
        <span className="font-body text-[10px] uppercase tracking-[0.14em] text-muted shrink-0">
          As seen on
        </span>
        <ProductHuntBadge />

        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />

        <span className="inline-flex shrink-0 items-center gap-1.5 font-body text-[11px] text-white">
          <span aria-hidden>🔥</span>
          {statsLoading ? (
            <span className="skeleton inline-block h-3.5 w-16" />
          ) : (
            <>
              <NumberTicker
                value={roastCount}
                startOnView={false}
                blur
                duration={0.85}
                format={(n) => n.toLocaleString('en-US')}
                className="font-semibold tabular-nums text-orange"
              />
              <span className="text-muted">{roastLabel}</span>
            </>
          )}
        </span>

        <TrustPill>No signup required</TrustPill>
        <TrustPill>15 languages</TrustPill>
      </div>
    </div>
  )
}
