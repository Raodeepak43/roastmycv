import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { PricingPlans } from '@/components/PricingPlans'
import { WhatWeOffer } from '@/components/WhatWeOffer'
import { DASHBOARD_TOOLS } from '@/lib/plans'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Plans & Pricing | MyCVRoast',
  description:
    'Free CV roasts, resume builder, LinkedIn roast, and 29+ AI career tools. Pro unlocks mock interview, voice interview, and unlimited everything — ₹149 one-time.',
  path: '/plans',
  keywords:
    'mycvroast pricing, resume roast pro, mock interview pro, linkedin roast, career ai tools india',
})

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-bg-beige flex flex-col">
      <SiteHeader activePath="plans" badge={{ label: '₹0 to start' }} />
      <div className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14 w-full">
        <header className="text-center mb-10 md:mb-14">
          <h1 className="font-display text-3xl md:text-5xl text-text-dark mb-3">Plans &amp; Pricing</h1>
          <p className="font-body text-sm md:text-base text-muted max-w-2xl mx-auto">
            Roast your CV, build an ATS resume, fix LinkedIn, practice mock interviews with AI voice, and
            use {DASHBOARD_TOOLS.length}+ career tools — free limits on every tier, Pro for unlimited.
          </p>
        </header>
        <PricingPlans layout="page" />
        <div className="mt-14 md:mt-20">
          <WhatWeOffer variant="full" />
        </div>
        <p className="font-body text-sm text-muted text-center mt-10">
          Read our{' '}
          <Link href="/blog/mycvroast-ai-tools-guide" className="text-orange hover:underline">
            tools guide
          </Link>
          , browse the{' '}
          <Link href="/guides" className="text-orange hover:underline">
            site map
          </Link>
          , or see{' '}
          <Link href="/privacy" className="text-orange hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
      <SiteFooter />
    </main>
  )
}
