import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/support'
import { ContactForm } from '@/components/contact/ContactForm'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

const X_URL = 'https://x.com/mycvroast'

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us | MyCVRoast',
  description:
    `Contact MyCVRoast for resume roast bugs, billing issues, or partnerships. Email ${SUPPORT_EMAIL} — we reply within 24 hours.`,
  path: '/contact',
  keywords: 'mycvroast contact, resume roast support, mycvroast help, billing support',
})

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-beige">
      <SiteHeader activePath="home" breadcrumb="Contact" />
      <div className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14 w-full">
        <header className="text-center mb-10 md:mb-12">
          <h1 className="font-display text-3xl md:text-5xl text-text-dark mb-3">Contact Us</h1>
          <p className="font-body text-sm md:text-base text-muted max-w-xl mx-auto">
            For resume roast bugs, billing issues, or partnerships
          </p>
        </header>

        <div className="rounded-[2rem] border border-black/10 bg-white p-5 md:p-8 space-y-8 shadow-sm mb-8">
          <div>
            <h2 className="font-display text-xl text-text-dark mb-1">Send us a message</h2>
            <p className="font-body text-sm text-muted">We reply within 24 hours.</p>
          </div>
          <ContactForm />
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-5 md:p-8 space-y-6 shadow-sm">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Email</p>
            <a
              href={SUPPORT_MAILTO}
              className="font-display text-xl md:text-2xl text-orange hover:text-brand-orange transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.14em] text-muted mb-2">X / Twitter</p>
            <a
              href={X_URL}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="font-body text-base md:text-lg text-text-dark hover:text-orange transition-colors"
            >
              @mycvroast
            </a>
          </div>

          <p className="font-body text-[13px] md:text-sm text-dim leading-relaxed border-t border-border pt-5">
            We reply within 24 hours.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
