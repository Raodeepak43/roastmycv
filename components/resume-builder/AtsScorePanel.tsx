import type { AtsResult } from '@/lib/resume-builder/ats-score'

export function AtsScorePanel({
  ats,
  theme = 'dark',
  layout = 'full',
}: {
  ats: AtsResult
  theme?: 'dark' | 'light'
  layout?: 'full' | 'compact'
}) {
  if (theme === 'light' && layout === 'compact') {
    return (
      <div className="dash-rb-ats-card">
        <div className="dash-rb-ats-card__row">
          <div className="dash-rb-ats-card__score" style={{ color: ats.color }}>
            {ats.score}
            <span>/100</span>
          </div>
          <div className="dash-rb-ats-card__meta">
            <p className="dash-rb-ats-card__label">Resume ATS score</p>
            <p className="dash-rb-ats-card__status" style={{ color: ats.color }}>
              {ats.label}
            </p>
          </div>
        </div>
        <div className="dash-rb-ats-card__track">
          <div
            className="dash-rb-ats-card__fill"
            style={{ width: `${Math.max(ats.score, 2)}%`, backgroundColor: ats.color }}
          />
        </div>
        {ats.missing.length > 0 && (
          <ul className="dash-rb-ats-card__tips">
            {ats.missing.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (theme === 'light') {
    return (
      <div className="rb-ats">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">ATS Score</p>
            <p className="text-4xl font-bold leading-none tabular-nums" style={{ color: ats.color }}>
              {ats.score}
              <span className="text-lg font-normal text-gray-400">/100</span>
            </p>
          </div>
          <p className="max-w-[180px] text-right text-xs font-medium" style={{ color: ats.color }}>
            {ats.label}
          </p>
        </div>
        <div className="rb-ats-track mb-3">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${ats.score}%`, backgroundColor: ats.color }}
          />
        </div>
        {ats.missing.length > 0 && (
          <ul className="m-0 list-none space-y-1 p-0">
            {ats.missing.slice(0, 4).map((item) => (
              <li key={item} className="flex gap-2 text-xs text-gray-600">
                <span className="shrink-0 text-ember">→</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="rb-ats-panel">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-body text-[10px] uppercase tracking-[0.14em] text-ember">⚡ Live ATS Scan</p>
          <p className="rb-ats-panel__score tabular-nums" style={{ color: ats.color }}>
            {ats.score}
            <span className="text-lg font-semibold text-muted">/100</span>
          </p>
        </div>
        <p
          className="max-w-[160px] text-right font-body text-[11px] font-semibold uppercase leading-snug tracking-wide"
          style={{ color: ats.color }}
        >
          {ats.label}
        </p>
      </div>
      <div className="rb-ats-panel__track mb-3">
        <div
          className="rb-ats-panel__fill"
          style={{ width: `${Math.max(ats.score, 2)}%`, backgroundColor: ats.color, color: ats.color }}
        />
      </div>
      {ats.missing.length > 0 && (
        <ul className="m-0 list-none space-y-1.5 p-0">
          {ats.missing.slice(0, 4).map((item) => (
            <li key={item} className="flex gap-2 font-body text-[11px] text-dim">
              <span className="shrink-0 text-ember">→</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
