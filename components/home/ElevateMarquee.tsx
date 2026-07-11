const ITEMS = [
  'Resume Roast',
  'ATS Resume Builder',
  'LinkedIn Roast',
  'Mock Interview AI',
  'Hinglish Feedback',
  '29 Career Tools',
]

function Track() {
  return (
    <>
      {ITEMS.map((label) => (
        <div key={label} className="flex items-center shrink-0">
          <h2 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl tracking-tighter uppercase text-text-dark">
            {label}
          </h2>
          <div className="w-6 h-6 md:w-10 md:h-10 bg-brand-orange rounded-full mx-6 md:mx-12 shrink-0" />
        </div>
      ))}
    </>
  )
}

export function ElevateMarquee() {
  return (
    <section className="w-full overflow-hidden py-12 md:py-20 relative z-30 bg-bg-beige" aria-hidden>
      <div className="flex whitespace-nowrap elevate-marquee-track">
        <div className="flex items-center animate-elevate-marquee">
          <Track />
        </div>
        <div className="flex items-center animate-elevate-marquee" aria-hidden>
          <Track />
        </div>
      </div>
    </section>
  )
}
