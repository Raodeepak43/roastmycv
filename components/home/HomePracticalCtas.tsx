import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  DASHBOARD_TOOLS,
  FREE_TOOL_COUNT,
  PRO_TOOL_COUNT,
} from '@/lib/tools/dashboard/config'
import { GUEST_FREE_ROASTS, formatProPrice } from '@/lib/plans'

const LANG_COUNT = 15
const INTENSITY_COUNT = 3

type Props = {
  roastCount: number
  statsLoading?: boolean
  roastLabel?: string
  onRoastClick?: () => void
}

export function HomePracticalCtas({
  roastCount,
  statsLoading = false,
  roastLabel = 'resumes roasted',
  onRoastClick,
}: Props) {
  const metrics = [
    { label: 'Free roasts', value: `${GUEST_FREE_ROASTS}`, sub: 'No signup' },
    { label: 'Career tools', value: String(DASHBOARD_TOOLS.length), sub: `${FREE_TOOL_COUNT} free tier` },
    { label: 'Pro unlock', value: formatProPrice(), sub: 'One-time · all tools' },
    { label: 'Languages', value: String(LANG_COUNT), sub: 'Hinglish included' },
  ]

  const quickLinks = [
    { href: '/career-tools', label: '29 career tools', desc: 'Live demos on every page' },
    { href: '/resume-builder', label: 'ATS resume builder', desc: '1 free PDF download' },
    { href: '/linkedin-roast', label: 'LinkedIn roast', desc: 'Profile feedback free' },
    { href: '/plans', label: 'Plans & pricing', desc: `${PRO_TOOL_COUNT} Pro-only tools` },
  ]

  return (
    <div className="home-practical-ctas">
      <div className="home-practical-ctas__metrics" aria-label="Product facts">
        {metrics.map((m) => (
          <div key={m.label} className="home-practical-ctas__metric">
            <p className="home-practical-ctas__metric-value">{m.value}</p>
            <p className="home-practical-ctas__metric-label">{m.label}</p>
            <p className="home-practical-ctas__metric-sub">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="home-practical-ctas__live">
        <span className="home-practical-ctas__live-dot" aria-hidden />
        {statsLoading ? (
          <span className="home-practical-ctas__live-text">
            <span className="skeleton inline-block h-4 w-16" /> {roastLabel}
          </span>
        ) : (
          <span className="home-practical-ctas__live-text">
            <strong>{roastCount.toLocaleString('en-US')}</strong> {roastLabel} · {INTENSITY_COUNT} roast modes
          </span>
        )}
      </div>

      <div className="home-practical-ctas__actions">
        {onRoastClick ? (
          <button type="button" className="btn-roast home-practical-ctas__primary" onClick={onRoastClick}>
            Roast my CV free
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : (
          <Link href="#roast" className="btn-roast home-practical-ctas__primary">
            Roast my CV free
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        <Link href="/career-tools" className="home-practical-ctas__secondary">
          Explore career tools
        </Link>
      </div>

      <ul className="home-practical-ctas__links">
        {quickLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="home-practical-ctas__link-card">
              <span className="home-practical-ctas__link-title">{link.label}</span>
              <span className="home-practical-ctas__link-desc">{link.desc}</span>
              <ArrowRight className="size-3.5 home-practical-ctas__link-arrow" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
