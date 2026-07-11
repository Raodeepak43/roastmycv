import Link from 'next/link'
import { MotionFadeUp } from '@/components/Motion'
import { FREE_LIMIT } from '@/lib/usage'

export function SeoIntroSection() {
  return (
    <section aria-label="About MyCVRoast" className="mt-10 md:mt-14">
      <MotionFadeUp className="rounded-[2rem] border border-border bg-bg-beige/40 p-5 md:p-6">
        <h2 className="font-display text-lg md:text-xl text-text-dark mb-3 tracking-wide">
          Free resume roast India — AI CV review in Hinglish &amp; English
        </h2>
        <div className="space-y-3 font-body text-[13px] md:text-sm text-dim leading-relaxed">
          <p>
            MyCVRoast is India&apos;s <strong className="text-text-dark">free resume roast</strong> and{' '}
            <strong className="text-text-dark">AI resume review</strong> tool — built for freshers, campus
            placement, and experienced hires. Upload PDF or TXT, get {FREE_LIMIT} brutally honest roasts
            per device with <strong className="text-text-dark">no signup</strong>.{' '}
            <Link href="/" className="text-orange hover:text-brand-orange transition-colors">
              Roast my resume free
            </Link>
            , try our{' '}
            <Link href="/tools/resume-roast-in-hinglish" className="text-orange hover:text-brand-orange transition-colors">
              Hinglish resume roast
            </Link>{' '}
            page or read the full{' '}
            <Link href="/blog/ai-resume-review-india" className="text-orange hover:text-brand-orange transition-colors">
              AI resume review India guide
            </Link>
            .
          </p>
          <p>
            Unlike generic checkers, a <strong className="text-text-dark">resume roast</strong> quotes your
            actual bullets and tells you what recruiters skip in six seconds. Choose clean, mild, or
            savage tone — including natural Hinglish feedback. See{' '}
            <Link href="/blog/resume-roast-vs-resume-review" className="text-orange hover:text-brand-orange transition-colors">
              roast vs review
            </Link>{' '}
            or{' '}
            <Link href="/blog/what-is-resume-roast" className="text-orange hover:text-brand-orange transition-colors">
              what a resume roast is
            </Link>
            .
          </p>
          <p>
            Need an <strong className="text-text-dark">ATS-friendly resume</strong> first? Use our{' '}
            <Link href="/resume-builder" className="text-orange hover:text-brand-orange transition-colors">
              free ATS resume builder
            </Link>
            , roast your LinkedIn on{' '}
            <Link href="/linkedin-roast" className="text-orange hover:text-brand-orange transition-colors">
              LinkedIn Roast
            </Link>
            , then practice with{' '}
            <Link href="/plans" className="text-orange hover:text-brand-orange transition-colors">
              mock interview &amp; 29+ career tools
            </Link>{' '}
            on your dashboard. More guides:{' '}
            <Link href="/best-resume-checker-india" className="text-orange hover:text-brand-orange transition-colors">
              free resume checker
            </Link>
            ,{' '}
            <Link href="/blog/fresher-resume-format" className="text-orange hover:text-brand-orange transition-colors">
              fresher resume format
            </Link>
            ,{' '}
            <Link href="/blog/ats-friendly-resume" className="text-orange hover:text-brand-orange transition-colors">
              is my resume ATS friendly
            </Link>
            ,{' '}
            <Link href="/guides" className="text-orange hover:text-brand-orange transition-colors">
              full site map
            </Link>
            ,{' '}
            <Link href="/blog/ats-resume-builder-free" className="text-orange hover:text-brand-orange transition-colors">
              ATS resume builder guide
            </Link>
            ,{' '}
            <Link href="/blog/cv-format-for-freshers" className="text-orange hover:text-brand-orange transition-colors">
              CV format for freshers
            </Link>
            ,{' '}
            <Link href="/blog/software-engineer-resume-guide" className="text-orange hover:text-brand-orange transition-colors">
              software engineer resume guide
            </Link>
            ,{' '}
            <Link href="/blog/mycvroast-vs-jobscan-vs-resume-worded" className="text-orange hover:text-brand-orange transition-colors">
              MyCVRoast vs Jobscan vs Resume Worded
            </Link>
            ,{' '}
            <Link href="/blog/zety-resume-builder-vs-mycvroast-india" className="text-orange hover:text-brand-orange transition-colors">
              Zety vs MyCVRoast
            </Link>
            ,{' '}
            <Link href="/blog/biodata-maker-for-job-india" className="text-orange hover:text-brand-orange transition-colors">
              biodata maker for job
            </Link>
            ,{' '}
            <Link href="/blog/help-making-a-resume-for-free-india" className="text-orange hover:text-brand-orange transition-colors">
              free resume help
            </Link>
            ,{' '}
            <Link href="/indian-resume-builder" className="text-orange hover:text-brand-orange transition-colors">
              Indian resume builder
            </Link>
            ,{' '}
            <Link href="/blog/free-downloadable-resume-builder" className="text-orange hover:text-brand-orange transition-colors">
              free PDF resume download
            </Link>
            , and{' '}
            <Link href="/blog/free-cv-maker-online" className="text-orange hover:text-brand-orange transition-colors">
              free CV maker online
            </Link>
            ,{' '}
            <Link href="/blog/resume-mistakes-to-avoid" className="text-orange hover:text-brand-orange transition-colors">
              resume mistakes to avoid
            </Link>
            ,{' '}
            <Link href="/blog/mycvroast-ai-tools-guide" className="text-orange hover:text-brand-orange transition-colors">
              29+ free career tools
            </Link>
            ,{' '}
            <Link href="/privacy" className="text-orange hover:text-brand-orange transition-colors">
              privacy policy
            </Link>
            . Also:{' '}
            <Link href="/about" className="text-orange hover:text-brand-orange transition-colors">
              about
            </Link>
            ,{' '}
            <Link href="/methodology" className="text-orange hover:text-brand-orange transition-colors">
              methodology
            </Link>
            ,{' '}
            <Link href="/faq" className="text-orange hover:text-brand-orange transition-colors">
              FAQ
            </Link>
            .
          </p>
        </div>
      </MotionFadeUp>
    </section>
  )
}
