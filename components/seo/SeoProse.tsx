import Link from 'next/link'

/** Lightweight markdown-ish renderer for SEO body copy (bold + links). */
export function SeoProse({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return (
    <p className="font-body text-[15px] text-[#ccc] leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="text-white font-semibold">
              {part.slice(2, -2)}
            </strong>
          )
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
          const [, label, href] = linkMatch
          const internal = href.startsWith('/')
          return internal ? (
            <Link key={i} href={href} className="text-orange hover:text-white underline underline-offset-2">
              {label}
            </Link>
          ) : (
            <a key={i} href={href} className="text-orange hover:text-white underline underline-offset-2">
              {label}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
