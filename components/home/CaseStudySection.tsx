import { MotionFadeUp } from '@/components/Motion'

const BEFORE = {
  title: "Riya's resume — 0 interview calls in 3 months.",
  points: ['No ATS keywords', 'Generic objective line', 'No quantified achievements'],
} as const

const AFTER = {
  title: 'Fixed in 1 evening using MyCVRoast.',
  points: ['ATS score 87%', 'Quantified bullet points', 'Strong 2-line summary'],
} as const

function BeforeIcon() {
  return (
    <svg className="size-3.5 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function AfterIcon() {
  return (
    <svg className="size-3.5 shrink-0 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ArrowDivider() {
  return (
    <div className="flex items-center justify-center py-2 md:py-0" aria-hidden>
      <div className="hidden md:block h-px w-full bg-border" />
      <svg
        className="size-6 shrink-0 text-orange mx-3 md:rotate-0 rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="hidden md:block h-px w-full bg-border" />
    </div>
  )
}

function CaseCard({
  variant,
  label,
  title,
  points,
}: {
  variant: 'before' | 'after'
  label: string
  title: string
  points: readonly string[]
}) {
  const isBefore = variant === 'before'
  const Icon = isBefore ? BeforeIcon : AfterIcon

  return (
    <article
      className={`neo-frame neo-frame--soft flex h-full flex-col p-4 md:p-5 ${
        isBefore
          ? 'border-red-500/30 bg-red-500/[0.05]'
          : 'border-emerald-500/30 bg-emerald-500/[0.05]'
      }`}
    >
      <p
        className={`mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] ${
          isBefore ? 'text-red-400' : 'text-emerald-400'
        }`}
      >
        {label}
      </p>
      <h3 className="font-display text-base md:text-lg text-white leading-snug mb-4">{title}</h3>
      <ul className="mt-auto space-y-2.5 list-none m-0 p-0">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 font-body text-[12px] md:text-[13px] text-[#ccc]">
            <Icon />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function CaseStudySection() {
  return (
    <section aria-label="Resume transformation case study" className="mt-10 md:mt-14">
      <p className="section-label mb-3">
        <span aria-hidden>📈</span> ILLUSTRATIVE EXAMPLE
      </p>
      <p className="font-body text-[11px] text-muted mb-4 -mt-1">
        Sample transformation — results vary by resume and role.
      </p>

      <MotionFadeUp>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
          <CaseCard variant="before" label="Before" title={BEFORE.title} points={BEFORE.points} />
          <ArrowDivider />
          <CaseCard variant="after" label="After roast" title={AFTER.title} points={AFTER.points} />
        </div>

        <div className="mt-5 md:mt-6 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/10 px-4 py-2 font-body text-[12px] md:text-[13px] font-medium text-orange">
            Example outcome — not a guaranteed result
          </p>
        </div>
      </MotionFadeUp>
    </section>
  )
}
