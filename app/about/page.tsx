import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPageShell, InfoSection, KeyTakeaways } from '@/components/seo/InfoPageShell'
import { TopicClusterNav } from '@/components/seo/TopicClusterNav'
import { LLMS_DETAILED_DESCRIPTION, LLMS_SHORT_DESCRIPTION } from '@/lib/llms/content'
import { aboutPageJsonLd } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { FREE_LIMIT } from '@/lib/usage'

export const metadata: Metadata = pageMetadata({
  title: 'About MyCVRoast — AI Resume Review India',
  description:
    'MyCVRoast is a free AI resume roast platform for Indian job seekers. Learn who we serve, what we build, and how honest CV feedback helps freshers and professionals.',
  path: '/about',
  keywords:
    'about mycvroast, ai resume review india, resume roast company, free cv checker india',
})

export default function AboutPage() {
  return (
    <InfoPageShell
      breadcrumb="About"
      title="About MyCVRoast"
      summary={LLMS_SHORT_DESCRIPTION}
      jsonLd={aboutPageJsonLd()}
    >
      <InfoSection id="summary" title="Summary">
        <p>{LLMS_DETAILED_DESCRIPTION}</p>
      </InfoSection>

      <InfoSection id="audience" title="Who we serve">
        <p>
          Students, freshers, software engineers, product managers, designers, marketing professionals,
          experienced hires, career switchers, and job seekers preparing campus placement or lateral moves in
          India and globally.
        </p>
      </InfoSection>

      <InfoSection id="takeaways" title="Key takeaways">
        <KeyTakeaways
          items={[
            `${FREE_LIMIT} free resume roasts per device — no signup required`,
            '15 languages including Hinglish for Indian recruiters',
            'Resume-specific feedback — not generic checklist scores',
            'ATS resume builder, LinkedIn roast, and 29+ career tools on Pro',
          ]}
        />
      </InfoSection>

      <InfoSection id="learn-more" title="Learn more">
        <ul className="space-y-2">
          <li>
            <Link href="/how-it-works" className="text-orange hover:text-brand-orange transition-colors">
              How it works
            </Link>
          </li>
          <li>
            <Link href="/methodology" className="text-orange hover:text-brand-orange transition-colors">
              Methodology &amp; AI process
            </Link>
          </li>
          <li>
            <Link href="/why-trust-us" className="text-orange hover:text-brand-orange transition-colors">
              Why trust us
            </Link>
          </li>
          <li>
            <Link href="/faq" className="text-orange hover:text-brand-orange transition-colors">
              FAQ
            </Link>
          </li>
        </ul>
      </InfoSection>

      <TopicClusterNav className="border-t border-border pt-6" />
    </InfoPageShell>
  )
}
