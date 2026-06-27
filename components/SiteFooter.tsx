'use client'

import Link from 'next/link'
import { FooterWordmark } from '@/components/FooterWordmark'
import { CinematicFooter } from '@/components/ui/motion-footer'
import { SupportChaiButton } from '@/components/SupportChai'
import { MotionFadeUp, MotionStagger, MotionStaggerItem } from '@/components/Motion'
import type { SupportCopy } from '@/app/i18n'

const X_URL = 'https://x.com/mycvroast'
const PH_URL =
  'https://www.producthunt.com/products/get-brutally-honest-feedback?embed=true&utm_source=embed&utm_medium=post_embed'

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
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'FAQ', href: '/#faq' },
      { label: '5 free roasts', href: '/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Resume Builder', href: '/resume-builder' },
      { label: 'What is a roast?', href: '/blog/what-is-resume-roast' },
      { label: 'ATS-friendly CV', href: '/blog/ats-friendly-resume' },
      { label: 'Fresher format', href: '/blog/fresher-resume-format' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Product Hunt', href: PH_URL, external: true },
      { label: 'X / Twitter', href: X_URL, external: true },
      { label: 'mycvroast.in', href: 'https://mycvroast.in' },
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
      { label: 'No signup', href: '/' },
      { label: 'No tracking', href: '/' },
      { label: 'Free forever', href: '/' },
      { label: 'For fun', href: '/' },
    ],
  },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className =
    'font-body text-[14px] text-[#B8B8B8] hover:text-white transition-colors leading-relaxed block w-fit'

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
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
  support,
  cinematic = true,
  cinematicInstant = false,
}: {
  tagline?: string
  support?: SupportCopy
  cinematic?: boolean
  cinematicInstant?: boolean
}) {
  return (
    <>
      <footer className="w-full bg-page border-t border-border mt-auto pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-6 md:pb-8">
          <MotionStagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
            {FOOTER_COLUMNS.map((col) => (
              <MotionStaggerItem key={col.title}>
                <p className="font-display text-base md:text-[17px] text-white mb-4 tracking-wide">
                  {col.title}
                </p>
                <ul className="space-y-3 list-none m-0 p-0">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                  {col.title === 'Connect' && support && (
                    <li className="pt-0.5">
                      <SupportChaiButton strings={support} variant="ghost" />
                    </li>
                  )}
                </ul>
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          {tagline && (
            <MotionFadeUp delay={0.15} className="mt-10 md:mt-12 pt-6 border-t border-[#333]">
              <p className="font-body text-[12px] md:text-[13px] text-[#999999] max-w-2xl">{tagline}</p>
            </MotionFadeUp>
          )}
        </div>
      </footer>

      {cinematic ? (
        <CinematicFooter
          tagline={tagline}
          instant={cinematicInstant}
          supportSlot={
            support ? (
              <SupportChaiButton
                strings={support}
                variant="ghost"
                className="!text-dim hover:!text-white !text-xs md:!text-sm !px-4 !py-2"
              />
            ) : undefined
          }
        />
      ) : (
        <FooterWordmark />
      )}
    </>
  )
}
