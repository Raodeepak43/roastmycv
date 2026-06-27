const GRADIENTS = [
  'linear-gradient(135deg, #0a0a0a 0%, #331100 40%, #FF4500 100%)',
  'linear-gradient(135deg, #000000 0%, #1a0033 50%, #6600cc 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #003322 50%, #00cc66 100%)',
  'linear-gradient(135deg, #1a0000 0%, #440000 50%, #FF4500 100%)',
  'linear-gradient(135deg, #000000 0%, #222222 50%, #FF4500 100%)',
]

function gradientForSlug(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i) * (i + 1)) % GRADIENTS.length
  return GRADIENTS[hash]
}

interface BlogFeaturedBannerProps {
  title: string
  slug: string
  compact?: boolean
}

export function BlogFeaturedBanner({ title, slug, compact }: BlogFeaturedBannerProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-[#1A1A1A] flex items-end ${
        compact ? 'h-32 mb-3' : 'h-48 md:h-56 mb-6'
      }`}
      style={{ background: gradientForSlug(slug) }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <p
        className={`relative z-10 font-display text-white leading-tight p-4 md:p-6 ${
          compact ? 'text-base md:text-lg line-clamp-2' : 'text-xl md:text-2xl'
        }`}
      >
        {title}
      </p>
    </div>
  )
}
