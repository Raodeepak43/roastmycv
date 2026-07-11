import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPageShell, InfoSection, KeyTakeaways } from '@/components/seo/InfoPageShell'
import { TopicClusterNav } from '@/components/seo/TopicClusterNav'
import { LLMS_LIMITATIONS } from '@/lib/llms/content'
import { PRO_PRICE_INR } from '@/lib/plans'
import { webPageJsonLd } from '@/lib/schema'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import { SUPPORT_EMAIL } from '@/lib/support'

export const metadata: Metadata = pageMetadata({
  title: 'Why Trust MyCVRoast — E-E-A-T & Transparency',
  description:
    'Why job seekers trust MyCVRoast: transparent methodology, privacy-first guest mode, real user reviews, and honest AI limitations.',
  path: '/why-trust-us',
  keywords: 'trust mycvroast, ai resume review safe, resume roast privacy, eeat resume tool',
})

export default function WhyTrustUsPage() {
  return (
    <InfoPageShell
      breadcrumb="Why trust us"
      title="Why Trust MyCVRoast"
      summary="Experience, expertise, authority, and trust signals for AI resume review — stated factually."
      jsonLd={webPageJsonLd({
        name: 'Why Trust MyCVRoast',
        description: 'Trust, transparency, and E-E-A-T for MyCVRoast AI resume review.',
        path: '/why-trust-us',
        breadcrumb: [{ name: 'Why trust us', path: '/why-trust-us' }],
      })}
    >
      <InfoSection id="experience" title="Experience">
        <p>
          MyCVRoast is built for Indian job-market context: campus placement CVs, Naukri exports, Hinglish
          feedback tone, and fresher vs experienced resume patterns. The product is used by students and
          professionals across engineering, product, design, and marketing roles.
        </p>
      </InfoSection>

      <InfoSection id="expertise" title="Expertise">
        <p>
          Feedback prompts mirror recruiter heuristics: six-second scan, quantified bullets, ATS
          parseability, and role-specific keyword alignment. The{' '}
          <Link href="/methodology" className="text-orange hover:text-white transition-colors">
            methodology page
          </Link>{' '}
          documents how analysis works and where AI can fail.
        </p>
      </InfoSection>

      <InfoSection id="authority" title="Authority">
        <KeyTakeaways
          items={[
            'Listed on Product Hunt and active on X @mycvroast',
            '126+ career blog guides at mycvroast.in/blog',
            `Canonical site: ${SITE_URL}`,
          ]}
        />
      </InfoSection>

      <InfoSection id="trust" title="Trust & privacy">
        <KeyTakeaways
          items={[
            'Guest roasts: no account required; files not stored after processing',
            'Signed-in users control account data; delete account from dashboard settings',
            'Payments via secure checkout; Pro is one-time — not a subscription trap',
            `Support: ${SUPPORT_EMAIL} — reply within 24 hours`,
          ]}
        />
        <p className="mt-4">
          Read the full{' '}
          <Link href="/privacy" className="text-orange hover:text-white transition-colors">
            privacy policy
          </Link>{' '}
          and{' '}
          <Link href="/terms" className="text-orange hover:text-white transition-colors">
            terms of service
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection id="limitations" title="Honest limitations">
        <ul className="list-disc pl-5 space-y-2">
          {LLMS_LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </InfoSection>

      <TopicClusterNav className="border-t border-border pt-6" />
    </InfoPageShell>
  )
}
