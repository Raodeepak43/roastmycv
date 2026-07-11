const TRUST_LOGOS = [
  'Product Hunt',
  'Campus India',
  'Remote Jobs',
  'Freshers',
  'LinkedIn',
  'ATS Ready',
] as const

export function TrustLogoStrip() {
  return (
    <div className="startup-trust-strip" aria-label="Trusted by job seekers">
      <p className="startup-trust-strip__label">Trusted by job seekers across India and beyond</p>
      <div className="startup-trust-strip__logos">
        {TRUST_LOGOS.map((name) => (
          <span key={name} className="startup-trust-strip__logo">
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
