import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPageShell, InfoSection, KeyTakeaways } from '@/components/seo/InfoPageShell'
import { TopicClusterNav } from '@/components/seo/TopicClusterNav'
import { LLMS_METHODOLOGY_STEPS } from '@/lib/llms/content'
import { webPageJsonLd } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { FREE_LIMIT } from '@/lib/usage'

export const metadata: Metadata = pageMetadata({
  title: 'How It Works — Free AI Resume Roast | MyCVRoast',
  description:
    'Upload PDF or TXT, pick language and intensity, get instant AI resume roast with score /10 and actionable fixes. No signup for first roasts.',
  path: '/how-it-works',
  keywords: 'how resume roast works, ai resume review steps, free cv checker process',
})

const STEPS = [
  {
    step: '1',
    title: 'Upload your resume',
    body: `Upload PDF or TXT (max 5 MB). Guest users get ${FREE_LIMIT} free roasts per device without creating an account.`,
  },
  {
    step: '2',
    title: 'Choose language & intensity',
    body: 'Select from 15 languages (Hinglish, English, and 13 more) and three tones: clean, mild, or savage.',
  },
  {
    step: '3',
    title: 'Get instant AI feedback',
    body: 'Receive a score out of 10, quoted bullets, ATS notes, grammar fixes, and shareable results in seconds.',
  },
]

export default function HowItWorksPage() {
  return (
    <InfoPageShell
      breadcrumb="How it works"
      title="How MyCVRoast Works"
      summary="Three steps from upload to actionable resume feedback — built for Indian freshers and experienced hires."
      jsonLd={webPageJsonLd({
        name: 'How MyCVRoast Works',
        description: 'Step-by-step guide to free AI resume roast on MyCVRoast.',
        path: '/how-it-works',
        breadcrumb: [{ name: 'How it works', path: '/how-it-works' }],
      })}
    >
      <InfoSection id="summary" title="Summary">
        <p>
          MyCVRoast reads your uploaded CV, extracts text, and runs AI analysis tuned for recruiter-style
          feedback. Output is resume-specific — the model quotes your bullets and explains what gets skipped
          in a six-second scan.
        </p>
      </InfoSection>

      <InfoSection id="steps" title="Step-by-step">
        <ol className="space-y-5">
          {STEPS.map((s) => (
            <li key={s.step} className="flex gap-4">
              <span className="font-display text-2xl text-orange shrink-0">{s.step}</span>
              <div>
                <h3 className="font-display text-white text-base mb-1">{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </InfoSection>

      <InfoSection id="takeaways" title="Key takeaways">
        <KeyTakeaways
          items={[
            'Works with PDF and TXT from Naukri, college templates, or LinkedIn exports',
            'Guest roasts are not stored — sign in to save history',
            'Pro unlocks unlimited roasts and dashboard career tools',
          ]}
        />
      </InfoSection>

      <InfoSection id="next" title="Next steps">
        <p>
          Read the{' '}
          <Link href="/methodology" className="text-orange hover:text-white transition-colors">
            methodology
          </Link>{' '}
          for ATS scoring details, or{' '}
          <Link href="/" className="text-orange hover:text-white transition-colors">
            roast your resume free
          </Link>
          .
        </p>
      </InfoSection>

      <TopicClusterNav className="border-t border-border pt-6" />
    </InfoPageShell>
  )
}
