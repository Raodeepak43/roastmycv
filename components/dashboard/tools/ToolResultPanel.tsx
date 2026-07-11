'use client'

import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { ToolMarkdown } from '@/components/dashboard/tools/ToolMarkdown'
import { parseToolSections } from '@/lib/tools/dashboard/parse-tool-markdown'

export function ToolResultPanel({
  content,
  title = 'Your report',
}: {
  content: string
  title?: string
}) {
  const sections = useMemo(() => parseToolSections(content), [content])
  const [activeId, setActiveId] = useState(sections[0]?.id ?? 'result')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (sections.length === 0) return null

  const copySection = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }

  const scrollTo = (id: string) => {
    setActiveId(id)
    document.getElementById(`tool-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="tool-result">
      <div className="tool-result__header">
        <div>
          <p className="tool-result__eyebrow">Analysis complete</p>
          <h2 className="tool-result__title">{title}</h2>
        </div>
        <span className="tool-result__count">{sections.length} sections</span>
      </div>

      <div className="tool-result__layout">
        {sections.length > 1 && (
          <nav className="tool-result__nav" aria-label="Report sections">
            {sections.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`tool-result__nav-btn ${activeId === s.id ? 'tool-result__nav-btn--active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className="tool-result__nav-num">{i + 1}</span>
                <span className="tool-result__nav-label">{s.title}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="tool-result__sections">
          {sections.map((section, i) => (
            <article
              key={section.id}
              id={`tool-section-${section.id}`}
              className="tool-result__card"
              onMouseEnter={() => setActiveId(section.id)}
            >
              <header className="tool-result__card-head">
                <div className="tool-result__card-title-wrap">
                  <span className="tool-result__card-num">{i + 1}</span>
                  <h3 className="tool-result__card-title">{section.title}</h3>
                </div>
                <button
                  type="button"
                  className="tool-result__copy"
                  onClick={() => void copySection(section.id, `${section.title}\n\n${section.body}`)}
                >
                  {copiedId === section.id ? (
                    <>
                      <Check className="size-3.5" aria-hidden />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" aria-hidden />
                      Copy
                    </>
                  )}
                </button>
              </header>
              <div className="tool-result__body">
                <ToolMarkdown content={section.body} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
