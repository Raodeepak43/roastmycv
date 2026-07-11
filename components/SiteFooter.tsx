'use client'

import Link from 'next/link'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'
import { CinematicFooter } from '@/components/ui/motion-footer'
import { MotionFadeUp, MotionStagger, MotionStaggerItem } from '@/components/Motion'

const X_URL = 'https://x.com/mycvroast'
const PH_URL =
  'https://www.producthunt.com/products/mycvroast?embed=true&utm_source=embed&utm_medium=post_embed'

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Roast',
    links: [
      { label: 'Roast my CV', href: '/' },
      { label: 'LinkedIn Roast', href: '/linkedin-roast' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Plans & pricing', href: '/plans' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Site map', href: '/guides' },
      { label: 'Free resume checker', href: '/best-resume-checker-india' },
      { label: 'ATS friendly check', href: '/ats-friendly-resume-checker' },
      { label: 'Resume Builder', href: '/resume-builder' },
      { label: 'Indian resume builder', href: '/indian-resume-builder' },
      { label: 'Plans', href: '/plans' },
      { label: 'Login', href: '/login?next=/dashboard' },
      { label: 'What is a roast?', href: '/blog/what-is-resume-roast' },
      { label: 'AI resume review', href: '/blog/ai-resume-review-india' },
      { label: 'Campus placement CV', href: '/blog/campus-placement-resume-tips' },
      { label: 'ATS-friendly CV', href: '/blog/ats-friendly-resume' },
      { label: 'CV vs resume', href: '/blog/cv-vs-resume-difference' },
      { label: 'Engineering resume', href: '/blog/engineering-resume-guide' },
      { label: 'Resume mistakes', href: '/blog/resume-mistakes-to-avoid' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Product Hunt', href: PH_URL, external: true },
      { label: 'X / Twitter', href: X_URL, external: true },
      { label: 'Resume builder', href: '/resume-builder' },
      { label: SUPPORT_EMAIL, href: SUPPORT_MAILTO, external: true },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: '15 languages', href: '/' },
      { label: '3 intensity levels', href: '/#how-it-works' },
      { label: 'Instant AI roast', href: '/' },
      { label: 'Share results', href: '/' },
    ],
  },
  {
    title: 'MyCVRoast',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Methodology', href: '/methodology' },
      { label: 'Why trust us', href: '/why-trust-us' },
      { label: 'Support', href: '/support' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
      { label: 'No signup', href: '/' },
      { label: 'Free forever', href: '/' },
    ],
  },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className =
    'font-body text-[13px] md:text-[14px] text-white/80 hover:text-brand-orange transition-colors leading-relaxed block w-fit'

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="nofollow noopener noreferrer" className={className}>
        {link.label}
      </a>
    )
  }

  if (link.href.startsWith('/#')) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

export function SiteFooter({
  tagline,
  cinematic = false,
  cinematicInstant = false,
}: {
  tagline?: string
  cinematic?: boolean
  cinematicInstant?: boolean
}) {
  return (
    <>
      <footer className="site-footer-elevate w-full bg-bg-dark text-white rounded-t-[3rem] relative z-[60] mt-auto pt-14 md:pt-20 pb-10 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 space-y-12 md:space-y-16">
          <MotionStagger className="site-footer__grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 md:gap-x-10">
            {FOOTER_COLUMNS.map((col) => (
              <MotionStaggerItem
                key={col.title}
                className={col.title === 'Resources' ? 'col-span-2 sm:col-span-1' : undefined}
              >
                <p className="site-footer__col-title font-display text-sm md:text-base mb-4 tracking-wide">
                  {col.title}
                </p>
                <ul
                  className={`space-y-2 list-none m-0 p-0${
                    col.title === 'Resources' ? ' site-footer__resources-list' : ''
                  }`}
                >
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <MotionFadeUp delay={0.08} className="elevate-footer-card p-8 md:p-12 lg:p-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10 md:mb-12">
              <div className="flex flex-col gap-5 max-w-md">
                <span className="font-body text-sm font-medium text-text-dark/80">© MyCVRoast 2026</span>
                <Link
                  href="/"
                  className="group inline-flex items-center gap-3 border-2 border-text-dark rounded-full px-7 py-3.5 font-semibold w-fit text-text-dark hover:bg-text-dark hover:text-white transition-colors"
                >
                  🔥 Roast my CV free
                  <span className="transform group-hover:translate-x-1 transition-transform" aria-hidden>→</span>
                </Link>
              </div>
              {tagline && (
                <p className="text-text-dark/80 font-body text-sm max-w-sm leading-relaxed md:text-right">{tagline}</p>
              )}
            </div>
            <h2 className="font-display font-bold text-[clamp(3rem,14vw,7.5rem)] leading-[0.9] tracking-tighter uppercase text-text-dark">
              MyCVRoast.
            </h2>
          </MotionFadeUp>
        </div>
      </footer>

      {cinematic ? <CinematicFooter tagline={tagline} instant={cinematicInstant} /> : null}
    </>
  )
}
