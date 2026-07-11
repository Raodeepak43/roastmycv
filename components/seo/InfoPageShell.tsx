import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

type InfoPageShellProps = {
  breadcrumb: string
  title: string
  summary: string
  children: ReactNode
  jsonLd?: Record<string, unknown>
}

export function InfoPageShell({ breadcrumb, title, summary, children, jsonLd }: InfoPageShellProps) {
  return (
    <main className="min-h-screen flex flex-col bg-bg-beige">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <SiteHeader activePath="home" breadcrumb={breadcrumb} />
      <article className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14 w-full">
        <header className="text-center mb-10 md:mb-12">
          <h1 className="font-display text-3xl md:text-5xl text-text-dark mb-3">{title}</h1>
          <p className="font-body text-sm md:text-base text-muted max-w-2xl mx-auto leading-relaxed">{summary}</p>
        </header>
        <div className="rounded-[2rem] border border-black/10 bg-white p-5 md:p-8 space-y-8 font-body text-[13px] md:text-sm text-dim leading-relaxed shadow-sm">
          {children}
        </div>
      </article>
      <SiteFooter />
    </main>
  )
}

export function InfoSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined}>
      <h2
        id={id ? `${id}-heading` : undefined}
        className="font-display text-lg md:text-xl text-text-dark mb-3 tracking-wide"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-text-dark/90">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <dl className="space-y-5">
      {items.map(({ q, a }) => (
        <div key={q}>
          <dt className="font-display text-text-dark text-base mb-1">{q}</dt>
          <dd>{a}</dd>
        </div>
      ))}
    </dl>
  )
}
