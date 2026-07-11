const GRADIENTS = [
  'linear-gradient(135deg, #1a0a05 0%, #f43c00 55%, #ff6a33 100%)',
  'linear-gradient(145deg, #0f0f0f 0%, #d93500 60%, #f43c00 100%)',
  'linear-gradient(120deg, #2a1208 0%, #f43c00 50%, #ff8a4c 100%)',
  'linear-gradient(160deg, #140806 0%, #c43000 45%, #ff4500 100%)',
  'linear-gradient(135deg, #1c1008 0%, #e63e00 70%, #ff6a33 100%)',
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
  /** When false, banner is visual-only (title shown below separately). */
  showTitle?: boolean
  label?: string
  className?: string
}

export function BlogFeaturedBanner({
  title,
  slug,
  compact,
  showTitle = true,
  label,
  className = '',
}: BlogFeaturedBannerProps) {
  return (
    <div
      className={`blog-cover-banner relative w-full overflow-hidden flex items-end ${
        compact ? 'min-h-[9.5rem] h-auto' : 'min-h-[11rem] md:min-h-[13rem] mb-6 rounded-[2rem] border border-black/10'
      } ${className}`.trim()}
      style={{ background: gradientForSlug(slug) }}
      aria-hidden={!showTitle}
    >
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #fff 0.5px, transparent 0.6px), radial-gradient(circle at 80% 70%, #fff 0.5px, transparent 0.6px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

      <div className={`relative z-10 w-full ${compact ? 'p-4 md:p-5' : 'p-5 md:p-7'}`}>
        {label && (
          <span className="blog-cover-banner__label inline-flex font-body text-[10px] uppercase tracking-widest rounded-full px-2.5 py-1 mb-3">
            {label}
          </span>
        )}
        {showTitle && (
          <p
            className={`blog-cover-banner__title font-display leading-[1.15] tracking-tight ${
              compact ? 'text-lg md:text-xl line-clamp-3' : 'text-xl md:text-3xl line-clamp-3'
            }`}
          >
            {title}
          </p>
        )}
      </div>
    </div>
  )
}
