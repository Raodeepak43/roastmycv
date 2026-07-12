'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'

type ActivePath = 'home' | 'linkedin-roast' | 'blog' | 'resume-builder' | 'plans' | 'career-tools'

interface SiteHeaderProps {
  variant?: 'home' | 'default'
  activePath?: ActivePath
  roastCount?: number
  statsLoading?: boolean
  statsSuffix?: string
  statsShortSuffix?: string
  usesLeft?: number
  roastsFreeLabel?: string
  usesTitle?: string
  joinLabel?: string
  onJoinClick?: () => void
  tickerItems?: string[]
  pinnedTicker?: string | null
  badge?: { label: React.ReactNode; accent?: boolean; title?: string }
  breadcrumb?: string
}

const NAV_ITEMS: { href: string; label: string; shortLabel: string; key: ActivePath }[] = [
  { href: '/', label: 'CV Roast', shortLabel: 'CV Roast', key: 'home' },
  { href: '/blog', label: 'Blog', shortLabel: 'Blog', key: 'blog' },
  { href: '/career-tools', label: 'Career Tools', shortLabel: 'Tools', key: 'career-tools' },
  { href: '/plans', label: 'Pricing', shortLabel: 'Pricing', key: 'plans' },
]

function NavLink({
  href,
  label,
  shortLabel,
  active,
  onClick,
}: {
  href: string
  label: string
  shortLabel: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`site-header__nav-link${active ? ' site-header__nav-link--active' : ''}`}
    >
      <span className="site-header__nav-full">{label}</span>
      <span className="site-header__nav-short">{shortLabel}</span>
    </Link>
  )
}

function stripJoinEmoji(label: string) {
  return label.replace(/^[^\wA-Za-z]+/, '').trim() || 'Join'
}

export function SiteHeader({
  variant = 'default',
  activePath = 'home',
  roastCount = 0,
  statsLoading = false,
  statsShortSuffix = 'CVs roasted',
  usesLeft,
  roastsFreeLabel = 'free',
  usesTitle,
  joinLabel = 'Join',
  onJoinClick,
  tickerItems,
  pinnedTicker,
  badge,
  breadcrumb,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const showTicker = variant === 'home' && tickerItems && tickerItems.length > 0
  const showUses = typeof usesLeft === 'number'
  const showStats = variant === 'home' && (statsLoading || roastCount > 0)
  const doubledTicker = showTicker ? [...tickerItems!, ...tickerItems!] : []
  const joinText = stripJoinEmoji(joinLabel)
  const usesLabel =
    showUses && usesLeft === 1 ? roastsFreeLabel.replace(/\broasts\b/i, 'roast') : roastsFreeLabel

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [activePath])

  const closeMenu = () => setMenuOpen(false)

  const breadcrumbRedundant =
    Boolean(breadcrumb) &&
    NAV_ITEMS.some((item) => item.key === activePath && item.label.toLowerCase() === breadcrumb!.toLowerCase())
  const showBreadcrumb = breadcrumb && !breadcrumbRedundant

  const statsBlock = statsLoading ? (
    <span className="skeleton inline-block h-3 w-20 align-middle" />
  ) : (
    <>
      <strong className="text-orange font-semibold tabular-nums">{roastCount.toLocaleString('en-US')}+</strong>
      <span className="site-header__ticker-stat-label"> {statsShortSuffix}</span>
    </>
  )

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <div className="site-header__inner">
          <div className="site-header__row">
            <div className="site-header__brand">
              <Logo
                variant="mark"
                href="/"
                onClick={closeMenu}
                className="site-header__logo site-header__logo--mobile"
              />
              <Logo
                variant="light"
                href="/"
                onClick={closeMenu}
                className="site-header__logo site-header__logo--desktop"
              />
              {showBreadcrumb ? (
                <>
                  <span className="site-header__crumb-sep hidden sm:inline" aria-hidden>
                    /
                  </span>
                  <span className="site-header__crumb hidden truncate sm:inline">{breadcrumb}</span>
                </>
              ) : null}
            </div>

            <nav className="site-header__nav hidden md:flex" aria-label="Main">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  shortLabel={item.shortLabel}
                  active={activePath === item.key}
                />
              ))}
            </nav>

            <div className="site-header__actions">
              {showUses && (
                <span
                  className="site-header__badge site-header__badge--accent site-header__badge--uses site-header__hide-sm"
                  title={usesTitle ?? `${usesLeft} ${usesLabel}`}
                >
                  {usesLeft} {usesLabel}
                </span>
              )}

              {badge && !showUses ? (
                <span
                  className={`site-header__badge site-header__hide-sm${badge.accent ? ' site-header__badge--accent' : ''}`}
                  title={badge.title}
                >
                  {badge.label}
                </span>
              ) : null}

              <Link
                href="/login?next=/dashboard"
                className="site-header__link site-header__link--login site-header__hide-sm"
              >
                Login
              </Link>

              {onJoinClick ? (
                <button
                  type="button"
                  onClick={onJoinClick}
                  className="site-header__btn-primary site-header__hide-sm"
                >
                  {joinText}
                </button>
              ) : activePath !== 'home' ? (
                <Link href="/" className="site-header__btn-primary site-header__hide-sm">
                  Roast Free
                </Link>
              ) : null}

              <button
                type="button"
                className="site-header__menu-btn"
                aria-expanded={menuOpen}
                aria-controls="site-header-mobile-nav"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
              </button>
            </div>
          </div>

          {showStats && !showTicker && (
            <div className="site-header__stats site-header__stats--mobile md:hidden" aria-live="polite">
              <span className="text-orange mr-1" aria-hidden>
                🔥
              </span>
              {statsBlock}
              {showUses && (
                <span className="site-header__stats-uses">
                  {' '}
                  · {usesLeft} {usesLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {menuOpen ? (
          <>
            <button
              type="button"
              className="site-header__backdrop"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <nav id="site-header-mobile-nav" className="site-header__mobile-nav" aria-label="Mobile">
              {showUses && (
                <p className="site-header__mobile-uses" aria-live="polite">
                  <span className="site-header__mobile-uses-dot" aria-hidden />
                  {usesLeft} {usesLabel} remaining
                </p>
              )}
              <div className="site-header__mobile-links">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMenu}
                    className={`site-header__mobile-link${activePath === item.key ? ' site-header__mobile-link--active' : ''}`}
                  >
                    {item.label}
                    <span className="site-header__mobile-link-arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                ))}
              </div>
              <div className="site-header__mobile-footer">
                <Link
                  href="/login?next=/dashboard"
                  onClick={closeMenu}
                  className="site-header__mobile-login"
                >
                  Login
                </Link>
                {onJoinClick ? (
                  <button type="button" onClick={() => { closeMenu(); onJoinClick() }} className="site-header__mobile-cta">
                    {joinText}
                  </button>
                ) : (
                  <Link href="/" onClick={closeMenu} className="site-header__mobile-cta site-header__mobile-cta--link">
                    🔥 Roast Free
                  </Link>
                )}
              </div>
            </nav>
          </>
        ) : null}
      </div>

      {showTicker ? (
        <div className="site-header__ticker" aria-label="Live roast activity">
          <div className="site-header__ticker-inner">
            <div className="site-header__ticker-pin">
              <span className="site-header__live">
                <span className="site-header__live-dot" aria-hidden />
                LIVE
              </span>
            </div>
            <div className="site-header__ticker-marquee">
              <div className="site-header__ticker-track">
                {doubledTicker.map((item, i) => {
                  const isYou = pinnedTicker != null && item === pinnedTicker
                  return (
                    <span
                      key={`${item}-${i}`}
                      className={`site-header__ticker-item${isYou ? ' site-header__ticker-item--you' : ''}`}
                    >
                      {item}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
