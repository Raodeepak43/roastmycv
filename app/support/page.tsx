import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPageShell, FaqList, InfoSection } from '@/components/seo/InfoPageShell'
import { PRO_PRICE_INR } from '@/lib/plans'
import { webPageJsonLd } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'

export const metadata: Metadata = pageMetadata({
  title: 'Support — Help & Billing | MyCVRoast',
  description:
    `MyCVRoast support for resume roast bugs, billing, refunds, and account issues. Email ${SUPPORT_EMAIL} — we reply within 24 hours.`,
  path: '/support',
  keywords: 'mycvroast support, resume roast help, billing refund mycvroast',
})

const SUPPORT_FAQ = [
  {
    q: 'How do I get a Pro refund?',
    a: `Email ${SUPPORT_EMAIL} within 7 days of purchase with your payment ID for a full refund review.`,
  },
  {
    q: 'Payment succeeded but Pro not unlocked?',
    a: `Contact ${SUPPORT_EMAIL} with your Razorpay payment ID. We manually verify and upgrade if needed.`,
  },
  {
    q: 'How do I delete my account?',
    a: 'Sign in → Dashboard → Settings → Delete account. Roast history and profile data are removed.',
  },
  {
    q: 'Resume roast failed or empty result?',
    a: 'Try TXT export or a simpler PDF. Scanned image PDFs may not extract text. If it persists, email us the error screenshot.',
  },
]

export default function SupportPage() {
  return (
    <InfoPageShell
      breadcrumb="Support"
      title="Support"
      summary="Help with resume roast errors, Pro billing (₹149 one-time), refunds, and account settings."
      jsonLd={webPageJsonLd({
        name: 'MyCVRoast Support',
        description: 'Customer support for MyCVRoast resume roast and billing.',
        path: '/support',
        breadcrumb: [{ name: 'Support', path: '/support' }],
      })}
    >
      <InfoSection id="contact" title="Contact support">
        <p className="mb-3">Email us for bugs, billing, partnerships, or account help.</p>
        <a
          href={SUPPORT_MAILTO}
          className="font-display text-xl text-orange hover:text-white transition-colors"
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="mt-3 text-muted">Typical response time: within 24 hours.</p>
      </InfoSection>

      <InfoSection id="pricing" title="Pricing help">
        <p>
          Pro is ₹{PRO_PRICE_INR} one-time (not monthly). See{' '}
          <Link href="/plans" className="text-orange hover:text-white transition-colors">
            plans &amp; pricing
          </Link>{' '}
          for feature comparison.
        </p>
      </InfoSection>

      <InfoSection id="faq" title="Support FAQ">
        <FaqList items={SUPPORT_FAQ} />
      </InfoSection>

      <InfoSection id="more" title="Self-service">
        <ul className="space-y-2">
          <li>
            <Link href="/faq" className="text-orange hover:text-white transition-colors">
              General FAQ
            </Link>
          </li>
          <li>
            <Link href="/how-it-works" className="text-orange hover:text-white transition-colors">
              How it works
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-orange hover:text-white transition-colors">
              Contact page
            </Link>
          </li>
        </ul>
      </InfoSection>
    </InfoPageShell>
  )
}
