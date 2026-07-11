import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPageShell, FaqList, InfoSection, KeyTakeaways } from '@/components/seo/InfoPageShell'
import { TopicClusterNav } from '@/components/seo/TopicClusterNav'
import {
  LLMS_GLOSSARY,
  LLMS_LIMITATIONS,
  LLMS_METHODOLOGY_STEPS,
} from '@/lib/llms/content'
import { faqPageJsonLd, webPageJsonLd } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Methodology — How AI Resume Analysis Works | MyCVRoast',
  description:
    'Transparent methodology: how MyCVRoast extracts resume text, scores ATS compatibility, generates roast feedback, handles privacy, and states AI limitations.',
  path: '/methodology',
  keywords:
    'resume ai methodology, ats scoring how it works, resume roast algorithm, ai resume review process',
})

const METHOD_FAQ = [
  {
    q: 'What AI models does MyCVRoast use?',
    a: 'We use large language models via secure API calls. Exact model versions may change as providers improve quality and cost.',
  },
  {
    q: 'Is my resume stored?',
    a: 'Guest uploads are processed and not persisted. Signed-in users can save roast history to their dashboard account.',
  },
  {
    q: 'How is the score calculated?',
    a: 'The score reflects structure, content quality, ATS parseability signals, and recruiter readability — presented as /10 with explained factors.',
  },
]

export default function MethodologyPage() {
  const faq = METHOD_FAQ.map(({ q, a }) => ({ question: q, answer: a }))

  return (
    <InfoPageShell
      breadcrumb="Methodology"
      title="Methodology"
      summary="How MyCVRoast analyzes resumes, optimizes for ATS, and delivers roast feedback — including limitations."
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          webPageJsonLd({
            name: 'MyCVRoast Methodology',
            description: 'AI resume analysis methodology and limitations.',
            path: '/methodology',
            breadcrumb: [{ name: 'Methodology', path: '/methodology' }],
          })['@graph'][0],
          faqPageJsonLd(faq),
        ],
      }}
    >
      <InfoSection id="process" title="Analysis process">
        <ol className="list-decimal pl-5 space-y-2">
          {LLMS_METHODOLOGY_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </InfoSection>

      <InfoSection id="ats" title="ATS optimization process">
        <p className="mb-3">
          Applicant Tracking Systems (ATS) parse resumes into structured fields. MyCVRoast flags formatting
          that breaks parsers (multi-column tables, headers in images, missing section labels) and suggests
          keyword alignment without stuffing.
        </p>
        <KeyTakeaways
          items={[
            'Detect section structure: experience, education, skills, projects',
            'Flag parseability issues common in Canva or multi-column templates',
            'Suggest measurable bullet rewrites with role-relevant keywords',
            'Live ATS score in the resume builder while editing',
          ]}
        />
      </InfoSection>

      <InfoSection id="definitions" title="Definitions">
        <dl className="space-y-4">
          {LLMS_GLOSSARY.map(({ term, definition }) => (
            <div key={term}>
              <dt className="font-display text-white">{term}</dt>
              <dd className="mt-1">{definition}</dd>
            </div>
          ))}
        </dl>
      </InfoSection>

      <InfoSection id="limitations" title="AI limitations">
        <ul className="list-disc pl-5 space-y-2">
          {LLMS_LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4">
          See also{' '}
          <Link href="/privacy" className="text-orange hover:text-white transition-colors">
            privacy policy
          </Link>{' '}
          and{' '}
          <Link href="/why-trust-us" className="text-orange hover:text-white transition-colors">
            why trust us
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection id="faq" title="Methodology FAQ">
        <FaqList items={METHOD_FAQ} />
      </InfoSection>

      <TopicClusterNav className="border-t border-border pt-6" />
    </InfoPageShell>
  )
}
