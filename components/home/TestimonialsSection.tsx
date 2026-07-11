import Link from 'next/link'
import { MotionFadeUp } from '@/components/Motion'

const PRODUCT_HUNT_URL = 'https://www.producthunt.com/products/mycvroast'

const TESTIMONIALS = [
  {
    quote:
      'Finally understood why I was not getting callbacks. Brutal but exactly what I needed.',
    name: 'Harsh K.',
    title: 'Software Engineer',
    subtitle: 'IIT Delhi',
    stars: 5,
  },
  {
    quote:
      'The Hinglish roast felt like a senior recruiter from Bangalore telling me the truth. Fixed my resume in one evening.',
    name: 'Priya M.',
    title: 'Fresher',
    subtitle: 'Campus placement · Bangalore',
    stars: 5,
  },
  {
    quote:
      'ATS score on the resume builder + roast feedback combo is insane value for free. Pro was a no-brainer.',
    name: 'Arjun S.',
    title: 'Product Manager',
    subtitle: '3 YOE · Mumbai',
    stars: 5,
  },
  {
    quote:
      'Uploaded my CV at midnight, got roasted in Spanish, shared it on LinkedIn. Zero regret.',
    name: 'Carlos R.',
    title: 'Data Analyst',
    subtitle: 'Remote · Mexico City',
    stars: 5,
  },
] as const

const AVATAR_PALETTE = [
  { bg: '#FF4500', fg: '#0a0a0a' },
  { bg: '#38BDC6', fg: '#0a0a0a' },
  { bg: '#F5C542', fg: '#0a0a0a' },
  { bg: '#A78BFA', fg: '#0a0a0a' },
  { bg: '#22C55E', fg: '#0a0a0a' },
  { bg: '#F472B6', fg: '#0a0a0a' },
  { bg: '#60A5FA', fg: '#0a0a0a' },
] as const

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/\./g, '')[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function avatarColors(name: string) {
  return AVATAR_PALETTE[hashName(name) % AVATAR_PALETTE.length]
}

function FeedbackBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-wide text-muted">
      User feedback
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const { bg, fg } = avatarColors(name)
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ring-2 ring-white/10"
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" aria-label="User testimonials" className="mt-10 md:mt-14">
      <p className="section-label mb-3">
        <span aria-hidden>★</span> WHAT USERS SAY
      </p>
      <p className="font-body text-[11px] text-muted mb-4 -mt-1">
        Representative feedback from early users — not live reviews.
      </p>
      <MotionFadeUp className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {TESTIMONIALS.map((item) => (
          <blockquote
            key={item.name}
            className="neo-frame neo-frame--soft border-border p-4 md:p-5 h-full flex flex-col"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="text-orange text-sm leading-none" aria-label={`${item.stars} out of 5 stars`}>
                {'★'.repeat(item.stars)}
                <span className="sr-only"> out of 5</span>
              </p>
              <FeedbackBadge />
            </div>
            <p className="font-body text-[13px] md:text-sm text-white leading-relaxed flex-1">
              &ldquo;{item.quote}&rdquo;
            </p>
            <footer className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <Avatar name={item.name} />
              <div className="min-w-0 flex-1">
                <cite className="not-italic font-display text-sm text-white">{item.name}</cite>
                <p className="font-body text-[12px] text-[#ccc] mt-0.5 leading-snug">{item.title}</p>
                <p className="font-body text-[11px] text-muted mt-0.5 leading-snug">{item.subtitle}</p>
              </div>
            </footer>
          </blockquote>
        ))}
      </MotionFadeUp>
      <p className="mt-5 text-center font-body text-[12px] text-muted">
        <Link
          href={PRODUCT_HUNT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-orange transition-colors hover:text-white"
        >
          View more on Product Hunt
          <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.31v2.409a.75.75 0 001.5 0V2.25a.75.75 0 00-.75-.75h-4.469a.75.75 0 000 1.5h2.128l-9.013 8.496a.75.75 0 00-.053 1.06z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </p>
    </section>
  )
}
