export type SitemapEntry = {
  url: string
  lastModified: Date
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export type ImageSitemapEntry = {
  pageUrl: string
  images: { loc: string; title?: string; caption?: string }[]
  lastModified: Date
}

export function toImageUrlset(entries: ImageSitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const imageTags = e.images
        .map(
          (img) => `<image:image>
<image:loc>${escapeXml(img.loc)}</image:loc>${img.title ? `\n<image:title>${escapeXml(img.title)}</image:title>` : ''}${img.caption ? `\n<image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
</image:image>`,
        )
        .join('\n')
      return `<url>
<loc>${escapeXml(e.pageUrl)}</loc>
<lastmod>${e.lastModified.toISOString()}</lastmod>
${imageTags}
</url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`
}

export type VideoSitemapEntry = {
  pageUrl: string
  videos: {
    contentUrl: string
    title: string
    description: string
    thumbnailUrl: string
  }[]
  lastModified: Date
}

export function toVideoUrlset(entries: VideoSitemapEntry[]): string {
  if (entries.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
</urlset>`
  }

  const urls = entries
    .map((e) => {
      const videoTags = e.videos
        .map(
          (v) => `<video:video>
<video:thumbnail_loc>${escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>
<video:title>${escapeXml(v.title)}</video:title>
<video:description>${escapeXml(v.description)}</video:description>
<video:content_loc>${escapeXml(v.contentUrl)}</video:content_loc>
</video:video>`,
        )
        .join('\n')
      return `<url>
<loc>${escapeXml(e.pageUrl)}</loc>
<lastmod>${e.lastModified.toISOString()}</lastmod>
${videoTags}
</url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>`
}

export function toUrlset(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) => `<url>
<loc>${escapeXml(e.url)}</loc>
<lastmod>${e.lastModified.toISOString()}</lastmod>
<changefreq>${e.changeFrequency}</changefreq>
<priority>${e.priority.toFixed(2)}</priority>
</url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export function toSitemapIndex(sitemaps: { loc: string; lastmod: Date }[]): string {
  const items = sitemaps
    .map(
      (s) => `<sitemap>
<loc>${escapeXml(s.loc)}</loc>
<lastmod>${s.lastmod.toISOString()}</lastmod>
</sitemap>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const SITEMAP_XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}
