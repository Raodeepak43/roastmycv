import Link from 'next/link'
import { ToolRoastEmbed } from '@/components/tools/ToolRoastEmbed'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import type { ToolPageConfig } from '@/lib/tools/config'
import { getToolBySlug } from '@/lib/tools/config'
import { siteUrl } from '@/lib/seo'

function RelatedLinks({ tool }: { tool: ToolPageConfig }) {
  const tools = (tool.relatedTools ?? [])
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean) as ToolPageConfig[]

  if (!tools.length && !tool.relatedBlog?.length) return null

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="font-body text-xs uppercase tracking-wider text-muted">Related</h2>
      <ul className="mt-3 space-y-2 font-body text-sm">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link href={`/tools/${t.slug}`} className="text-orange hover:text-brand-orange transition-colors">
              {t.h1}
            </Link>
          </li>
        ))}
        {tool.relatedBlog?.map((slug) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`} className="text-dim hover:text-orange transition-colors">
              Blog: {slug.replace(/-/g, ' ')}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ToolPageContent({ tool }: { tool: ToolPageConfig }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-beige">
      <SiteHeader variant="default" activePath="home" />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <nav className="mb-6 font-body text-xs text-muted">
          <Link href="/" className="hover:text-orange transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tools/resume-roast-in-hinglish" className="hover:text-orange transition-colors">
            Tools
          </Link>
          <span className="mx-2">/</span>
          <span className="text-dim">{tool.h1}</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight mb-4">{tool.h1}</h1>

        <div className="space-y-4 font-body text-[15px] text-dim leading-relaxed mb-8">
          {tool.intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        {tool.languageNote && (
          <p className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-body text-sm text-amber-200">
            {tool.languageNote}
          </p>
        )}

        {tool.bullets && tool.bullets.length > 0 && (
          <ul className="mb-8 space-y-2 font-body text-sm text-dim list-disc pl-5">
            {tool.bullets.map((b) => (
              <li key={b.slice(0, 50)}>{b}</li>
            ))}
          </ul>
        )}

        {tool.callouts?.map((c) => (
          <div key={c.title} className="mb-6 neo-frame neo-frame--soft border-border px-4 py-3">
            <p className="font-display text-sm text-orange">{c.title}</p>
            <p className="mt-1 font-body text-sm text-dim">{c.body}</p>
          </div>
        ))}

        <ToolRoastEmbed
          defaultLanguage={tool.defaultLanguage}
          defaultIntensity={tool.defaultIntensity}
          hideLanguagePicker={tool.hideLanguagePicker}
          hideIntensityPicker={tool.hideIntensityPicker}
        />

        <p className="mt-4 text-center font-body text-xs text-muted">
          Or{' '}
          <Link href="/" className="text-orange hover:text-white">
            roast on homepage
          </Link>
          {' · '}
          <Link href="/resume-builder" className="text-orange hover:text-white">
            fix in resume builder
          </Link>
        </p>

        {tool.sampleRoasts && tool.sampleRoasts.length > 0 && (
          <section className="mt-10">
            <h2 className="font-body text-xs uppercase tracking-wider text-muted mb-4">Sample roast snippets</h2>
            <div className="space-y-3">
              {tool.sampleRoasts.map((s, i) => (
                <blockquote
                  key={i}
                  className="rounded-lg border border-border bg-black/30 px-4 py-3 font-body text-sm text-[#ddd]"
                >
                  {s.label && <span className="block text-[10px] uppercase tracking-wider text-orange mb-1">{s.label}</span>}
                  <span className="text-orange font-semibold">{s.score}/10</span> — {s.line}
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {tool.faq && tool.faq.length > 0 && (
          <section className="mt-10" id="faq">
            <h2 className="font-body text-xs uppercase tracking-wider text-muted mb-4">FAQ</h2>
            <div className="space-y-4">
              {tool.faq.map((item) => (
                <div key={item.question} className="border-b border-border pb-4 last:border-0">
                  <h3 className="font-display text-base text-white mb-1">{item.question}</h3>
                  <p className="font-body text-sm text-dim leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <RelatedLinks tool={tool} />

        <div className="mt-10 text-center">
          <Link href="/" className="btn-roast inline-block px-8 py-3 text-base">
            🔥 Roast my CV free
          </Link>
        </div>
      </main>

      <SiteFooter tagline="Free AI resume roast · India-first · 15 languages" />
    </div>
  )
}

export function toolPageUrl(slug: string) {
  return siteUrl(`/tools/${slug}`)
}
