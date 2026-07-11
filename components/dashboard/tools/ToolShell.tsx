'use client'

import Link from 'next/link'
import type { ToolAccess, ToolSlug } from '@/lib/tools/dashboard/config'
import { CvInput } from '@/components/dashboard/tools/CvInput'
import { useDashboardCv } from '@/components/dashboard/DashboardCvProvider'
import { ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolAnalyzingPanel'
import { ToolResultPanel } from '@/components/dashboard/tools/ToolResultPanel'
import { ToolHistoryStrip } from '@/components/dashboard/tools/ToolHistoryStrip'

export { ToolAnalyzingPanel } from '@/components/dashboard/tools/ToolAnalyzingPanel'
export { ToolResultPanel } from '@/components/dashboard/tools/ToolResultPanel'
export { ToolHistoryStrip } from '@/components/dashboard/tools/ToolHistoryStrip'

export function ToolShellLayout({
  title,
  subtitle,
  access,
  isPro,
  used,
  limit,
  wide = false,
  immersive = false,
  results = false,
  children,
}: {
  title: string
  subtitle: string
  access: ToolAccess
  isPro?: boolean
  used?: number
  limit?: number
  wide?: boolean
  immersive?: boolean
  results?: boolean
  children: React.ReactNode
}) {
  const pageClass = [
    'dash-tool-page',
    (wide || results) && 'dash-tool-page--wide',
    results && 'dash-tool-page--results',
    immersive && 'dash-tool-page--immersive',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={pageClass}>
      {!immersive && (
        <header className="dash-tool-page__head">
          <div className="dash-tool-page__title-row">
            <h2 className="dash-tool-page__title">{title}</h2>
            {access.proOnly ? (
              <span className="dash-tools-badge">Pro</span>
            ) : (
              <span className="dash-tools-badge dash-tools-badge--free">Free</span>
            )}
          </div>
          <p className="dash-tool-page__subtitle">{subtitle}</p>
          {!isPro && !access.proOnly && !access.unlimited && limit !== undefined && limit < 999 && (
            <p className="dash-tool-page__usage">
              {access.daily ? 'Today' : 'Free uses'}: {used ?? 0} / {limit}
            </p>
          )}
        </header>
      )}
      <div className={`dash-tool-page__body${immersive ? ' dash-tool-page__body--immersive' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export function ToolShell({
  title,
  subtitle,
  access,
  isPro,
  used,
  limit,
  needsCv = true,
  toolSlug,
  historyRefresh = 0,
  historyActiveId,
  onHistoryLoad,
  wide = false,
  immersive = false,
  results = false,
  children,
}: {
  title: string
  subtitle: string
  access: ToolAccess
  isPro?: boolean
  used?: number
  limit?: number
  needsCv?: boolean
  toolSlug?: ToolSlug
  historyRefresh?: number
  historyActiveId?: string | null
  onHistoryLoad?: (text: string, id: string) => void
  wide?: boolean
  immersive?: boolean
  results?: boolean
  children: React.ReactNode
}) {
  const { loading: cvLoading } = useDashboardCv()

  return (
    <ToolShellLayout
      title={title}
      subtitle={subtitle}
      access={access}
      isPro={isPro}
      used={used}
      limit={limit}
      wide={wide}
      immersive={immersive}
      results={results}
    >
      {needsCv && !cvLoading && (
        <div className="dash-tools-card dash-tools-card--frame p-5">
          <CvInput label="Your CV" />
        </div>
      )}
      {toolSlug && onHistoryLoad && !immersive && (
        <ToolHistoryStrip
          toolSlug={toolSlug}
          refreshKey={historyRefresh}
          activeId={historyActiveId}
          onLoad={onHistoryLoad}
        />
      )}
      {children}
    </ToolShellLayout>
  )
}

export function ToolPaywall({ message }: { message: string }) {
  return (
    <div className="dash-tools-pro-banner dash-tools-card dash-tools-card--frame p-4 space-y-3">
      <p>{message}</p>
      <Link href="/dashboard/plans" className="dash-tools-btn inline-flex text-sm">
        Upgrade to Pro — ₹149
      </Link>
    </div>
  )
}

export function CopyButton({ text, label = '📋 Copy' }: { text: string; label?: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
  }
  return (
    <button type="button" onClick={copy} className="dash-tools-btn--ghost dash-tools-btn text-xs py-2 px-3">
      {label}
    </button>
  )
}

export function ToolError({ message }: { message: string }) {
  return <div className="dash-tools-error">{message}</div>
}

export function StreamingOutput({
  text,
  loading,
  title = 'Your report',
  analyzingTitle = 'Analysing',
}: {
  text: string
  loading?: boolean
  title?: string
  analyzingTitle?: string
}) {
  if (loading && !text.trim()) {
    return <ToolAnalyzingPanel title={analyzingTitle} />
  }
  if (!text.trim()) return null
  return <ToolResultPanel content={text} title={title} />
}

export function MarkdownBlock({ content, title = 'Your report' }: { content: string; title?: string }) {
  if (!content.trim()) return null
  return <ToolResultPanel content={content} title={title} />
}
