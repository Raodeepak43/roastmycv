import Link from 'next/link'
import { GUEST_FREE_ROASTS, PUBLIC_PLANS, DASHBOARD_TOOLS, FREE_TOOL_COUNT } from '@/lib/plans'

interface PricingPlansProps {
  /** Compact section on homepage vs full page layout */
  layout?: 'section' | 'page'
}

export function PricingPlans({ layout = 'section' }: PricingPlansProps) {
  const isPage = layout === 'page'

  return (
    <div className={isPage ? 'w-full max-w-4xl mx-auto' : 'w-full'}>
      {isPage && (
        <p className="font-body text-sm text-dim text-center max-w-xl mx-auto mb-10 leading-relaxed">
          Start free — no signup needed. Create an account for saved roasts, or go Pro when you want
          unlimited everything.
        </p>
      )}

      <div className="pricing-grid">
        {PUBLIC_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`pricing-card${plan.highlighted ? ' pricing-card--highlight' : ''}`}
          >
            {plan.badge ? (
              <span className="pricing-card__badge">{plan.badge}</span>
            ) : null}

            <div className="pricing-card__head">
              <span className="pricing-card__emoji" aria-hidden>
                {plan.emoji}
              </span>
              <h3 className="pricing-card__name">{plan.name}</h3>
            </div>

            <p className="pricing-card__price">
              {plan.price}
              <span className="pricing-card__price-note"> / {plan.priceNote}</span>
            </p>

            <ul className="pricing-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {plan.disabled ? (
              <>
                <button
                  type="button"
                  disabled
                  className="pricing-card__cta pricing-card__cta--disabled"
                >
                  {plan.cta.label}
                </button>
                {plan.disabledNote ? (
                  <p className="pricing-card__note">{plan.disabledNote}</p>
                ) : null}
              </>
            ) : (
              <Link href={plan.cta.href} className="pricing-card__cta btn-roast">
                {plan.cta.label}
              </Link>
            )}
          </article>
        ))}
      </div>

      <p className="pricing-footnote">
        <strong className="text-text-dark">Guest vs account:</strong> The public site gives{' '}
        {GUEST_FREE_ROASTS} roasts per device without logging in. A free account adds saved roast
        history, resume-builder perks, and {FREE_TOOL_COUNT}+ dashboard career tools with free limits.
        Pro unlocks mock interview, voice interview, and unlimited use on all {DASHBOARD_TOOLS.length} tools.
      </p>
    </div>
  )
}
