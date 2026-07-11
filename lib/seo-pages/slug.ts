/** URL slug helpers for SEO keyword pages. */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function truncateMetaTitle(title: string, max = 60): string {
  if (title.length <= max) return title
  const cut = title.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

export function truncateMetaDescription(desc: string, max = 155): string {
  if (desc.length <= max) return desc
  const cut = desc.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

export function extractRoleSlug(keyword: string): string {
  const k = keyword.toLowerCase().trim()
  const suffixes = [' resume checker', ' resume check', ' cv checker']
  for (const s of suffixes) {
    if (k.endsWith(s)) return slugify(k.slice(0, -s.length))
  }
  return slugify(keyword)
}

export function extractDegreeSlug(keyword: string): string {
  const k = keyword.toLowerCase().trim()
  const suffixes = [' fresher resume', ' resume for freshers', ' fresher cv']
  for (const s of suffixes) {
    if (k.endsWith(s)) return slugify(k.slice(0, -s.length))
  }
  return slugify(keyword)
}

export function hashPick<T>(seed: string, items: T[]): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return items[h % items.length]
}
