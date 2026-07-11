export interface ToolResultSection {
  id: string
  title: string
  body: string
}

function slugify(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `section-${index}`
}

/** Split AI markdown on ## or # headings into navigable sections. */
export function parseToolSections(content: string): ToolResultSection[] {
  const trimmed = content.trim()
  if (!trimmed) return []

  const hasH2 = /^##\s/m.test(trimmed)
  const hasH1 = /^#\s/m.test(trimmed)

  if (!hasH2 && !hasH1) {
    return [{ id: 'result', title: 'Results', body: trimmed }]
  }

  const splitPattern = hasH2 ? /^##\s+/m : /^#\s+/m
  const chunks = trimmed.split(splitPattern).filter(Boolean)

  return chunks.map((chunk, index) => {
    const nl = chunk.indexOf('\n')
    const title = nl === -1 ? chunk.trim() : chunk.slice(0, nl).trim()
    const body = nl === -1 ? '' : chunk.slice(nl + 1).trim()
    return {
      id: slugify(title, index),
      title: title || `Section ${index + 1}`,
      body,
    }
  })
}

export function formatToolSectionHtml(body: string): string {
  let html = body
    .replace(/^### (.+)$/gm, '<h4 class="tool-result-h4">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="tool-result-list">${m}</ul>`)
  html = html.replace(/\n\n/g, '</p><p class="tool-result-p">')
  if (html && !html.startsWith('<')) {
    html = `<p class="tool-result-p">${html}</p>`
  }

  return html
}
