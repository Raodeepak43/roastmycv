import type { AtsResult } from '@/lib/resume-builder/ats-score'

export function AtsScorePanel({ ats }: { ats: AtsResult }) {
  return (
    <div className="border border-border bg-[#0F0F0F] p-4 mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="font-body text-[10px] text-dim uppercase tracking-[0.12em] mb-1">ATS Score</p>
          <p className="font-display text-4xl leading-none tabular-nums" style={{ color: ats.color }}>
            {ats.score}
            <span className="text-lg text-muted">/100</span>
          </p>
        </div>
        <p className="font-body text-[12px] text-right max-w-[180px]" style={{ color: ats.color }}>
          {ats.label}
        </p>
      </div>
      <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden mb-3">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: `${ats.score}%`, backgroundColor: ats.color }}
        />
      </div>
      {ats.missing.length > 0 && (
        <ul className="space-y-1 m-0 p-0 list-none">
          {ats.missing.slice(0, 4).map((item) => (
            <li key={item} className="font-body text-[11px] text-dim flex gap-2">
              <span className="text-orange shrink-0">→</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
