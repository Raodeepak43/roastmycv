import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata = pageMetadata({
  title: 'Privacy Policy | MyCVRoast',
  description: 'How MyCVRoast handles your resume uploads, cookies, analytics, and account data.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-page">
      <SiteHeader activePath="home" breadcrumb="Privacy" />
      <article className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14 font-body text-sm text-dim leading-relaxed">
        <h1 className="font-display text-3xl text-white mb-6">Privacy Policy</h1>
        <p className="mb-4 text-muted">Last updated: June 27, 2026</p>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-white">Resume uploads</h2>
          <p>
            Anonymous roasts: your resume file is parsed in memory, sent to our AI provider for
            analysis, and <strong className="text-white">not stored</strong> on our servers after
            processing. We do not sell or share resume content.
          </p>

          <h2 className="font-display text-lg text-white">Account data</h2>
          <p>
            If you sign in, we store your email, roast history, and usage limits in our secure cloud database to
            power your dashboard. You can request deletion by emailing{' '}
            <a href={SUPPORT_MAILTO} className="text-orange">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>

          <h2 className="font-display text-lg text-white">Analytics &amp; ads</h2>
          <p>
            We may use privacy-friendly analytics and Google Analytics (if configured), and Google AdSense. These
            services may set cookies. You can block cookies in your browser settings.
          </p>

          <h2 className="font-display text-lg text-white">Payments</h2>
          <p>
            Pro upgrades are processed by our secure payment partner. We do not store card or UPI details — payment data is handled under their privacy policy.
          </p>

          <h2 className="font-display text-lg text-white">Contact</h2>
          <p>
            Questions? Email{' '}
            <a href={SUPPORT_MAILTO} className="text-orange">
              {SUPPORT_EMAIL}
            </a>{' '}
            or DM{' '}
            <a href="https://x.com/mycvroast" rel="nofollow noopener noreferrer" className="text-orange">
              @mycvroast
            </a>
            .
          </p>

          <p className="pt-4 border-t border-[#1A1A1A]">
            Explore our{' '}
            <Link href="/guides" className="text-orange hover:underline">
              complete site map
            </Link>
            ,{' '}
            <Link href="/blog" className="text-orange hover:underline">
              career guides
            </Link>
            , and{' '}
            <Link href="/terms" className="text-orange hover:underline">
              terms of service
            </Link>
            .
          </p>
        </section>
      </article>
      <SiteFooter cinematic={false} />
    </main>
  )
}
