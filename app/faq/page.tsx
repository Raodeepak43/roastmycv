import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPageShell, FaqList, InfoSection } from '@/components/seo/InfoPageShell'
import { TopicClusterNav } from '@/components/seo/TopicClusterNav'
import { HOME_FAQ, faqPageJsonLd, webPageJsonLd } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { PRO_PRICE_INR } from '@/lib/plans'
import { FREE_LIMIT } from '@/lib/usage'

export const metadata: Metadata = pageMetadata({
  title: 'FAQ — Resume Roast, Pricing & Privacy | MyCVRoast',
  description:
    `Frequently asked questions about MyCVRoast: free resume roast (${FREE_LIMIT}/device), Hinglish mode, ATS checks, privacy, and Pro pricing at ₹${PRO_PRICE_INR}.`,
  path: '/faq',
  keywords:
    'mycvroast faq, resume roast questions, is resume roast free, hinglish resume roast faq',
})

const EXTENDED_FAQ = [
  ...HOME_FAQ,
  {
    q: 'What file formats are supported?',
    a: 'PDF and TXT up to 5 MB. Text must be extractable — scanned image-only PDFs may not parse well.',
  },
  {
    q: 'Where can I read the full AI knowledge base?',
    a: 'See /llms-full.txt on mycvroast.in for structured product documentation for AI systems.',
  },
] as const

export default function FaqPage() {
  const schemaFaq = EXTENDED_FAQ.map(({ q, a }) => ({ question: q, answer: a }))

  return (
    <InfoPageShell
      breadcrumb="FAQ"
      title="Frequently Asked Questions"
      summary="Factual answers about resume roast, pricing, languages, privacy, and ATS feedback on MyCVRoast."
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          webPageJsonLd({
            name: 'MyCVRoast FAQ',
            description: 'Frequently asked questions about AI resume roast.',
            path: '/faq',
            breadcrumb: [{ name: 'FAQ', path: '/faq' }],
          })['@graph'][0],
          faqPageJsonLd(schemaFaq),
        ],
      }}
    >
      <InfoSection id="summary" title="Summary">
        <p>
          MyCVRoast offers {FREE_LIMIT} free AI resume roasts per device without signup. Pro is a one-time ₹
          {PRO_PRICE_INR} upgrade for unlimited usage. Guest files are not stored after processing.
        </p>
      </InfoSection>

      <InfoSection id="questions" title="Questions & answers">
        <FaqList items={[...EXTENDED_FAQ]} />
      </InfoSection>

      <InfoSection id="more" title="More help">
        <ul className="space-y-2">
          <li>
            <Link href="/support" className="text-orange hover:text-white transition-colors">
              Support
            </Link>
          </li>
          <li>
            <Link href="/how-it-works" className="text-orange hover:text-white transition-colors">
              How it works
            </Link>
          </li>
          <li>
            <Link href="/methodology" className="text-orange hover:text-white transition-colors">
              Methodology
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-orange hover:text-white transition-colors">
              Contact
            </Link>
          </li>
        </ul>
      </InfoSection>

      <TopicClusterNav className="border-t border-border pt-6" />
    </InfoPageShell>
  )
}
