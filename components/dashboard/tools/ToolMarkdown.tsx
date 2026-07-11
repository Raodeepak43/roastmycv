'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ToolMarkdown({ content }: { content: string }) {
  if (!content.trim()) return null

  return (
    <div className="tool-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h3: ({ children }) => <h4 className="tool-result-h4">{children}</h4>,
        h4: ({ children }) => <h4 className="tool-result-h4">{children}</h4>,
        p: ({ children }) => <p className="tool-result-p">{children}</p>,
        ul: ({ children }) => <ul className="tool-result-list">{children}</ul>,
        ol: ({ children }) => <ol className="tool-result-olist">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        table: ({ children }) => (
          <div className="tool-md-table-wrap">
            <table className="tool-md-table">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => <th>{children}</th>,
        td: ({ children }) => <td>{children}</td>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        blockquote: ({ children }) => <blockquote className="tool-md-quote">{children}</blockquote>,
        code: ({ className, children }) => {
          const isBlock = className?.includes('language-')
          if (isBlock) {
            return <pre className="tool-md-pre"><code>{children}</code></pre>
          }
          return <code className="tool-md-code">{children}</code>
        },
        hr: () => <hr className="tool-md-hr" />,
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
