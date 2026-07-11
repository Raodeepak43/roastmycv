const FETCH_TIMEOUT_MS = 12_000

/** Normalize and validate a public LinkedIn /in/ profile URL (SSRF-safe: linkedin.com only). */
export function normalizeLinkedInProfileUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  if (host !== 'linkedin.com') return null

  const match = url.pathname.match(/^\/in\/([\w%-]+)\/?$/i)
  if (!match?.[1]) return null

  const slug = decodeURIComponent(match[1]).replace(/\/+$/, '')
  if (!slug || slug.length > 100) return null

  return `https://www.linkedin.com/in/${encodeURIComponent(slug)}/`
}

function extractMetaContent(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return decodeHtmlEntities(m[1].trim())
  }
  return ''
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function htmlToPlainText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
  const text = withoutScripts
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
  return decodeHtmlEntities(text)
}

function looksLikeLoginWall(html: string): boolean {
  const lower = html.slice(0, 80_000).toLowerCase()
  return (
    lower.includes('authwall') ||
    lower.includes('join linkedin') ||
    (lower.includes('sign in') && lower.includes('linkedin') && html.length < 60_000)
  )
}

function extractProfileText(html: string): string {
  const title = extractMetaContent(html, 'og:title') || extractMetaContent(html, 'title')
  const description = extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description')

  const jsonLdBlocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  )
  const jsonParts: string[] = []
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block[1]) as Record<string, unknown>
      const name = typeof parsed.name === 'string' ? parsed.name : ''
      const headline = typeof parsed.headline === 'string' ? parsed.headline : ''
      const desc = typeof parsed.description === 'string' ? parsed.description : ''
      jsonParts.push([name, headline, desc].filter(Boolean).join('\n'))
    } catch {
      /* ignore malformed JSON-LD */
    }
  }

  const bodySnippet = htmlToPlainText(html).slice(0, 12_000)
  const combined = [title, description, ...jsonParts, bodySnippet].filter(Boolean).join('\n\n')
  return combined.replace(/\n{3,}/g, '\n\n').trim()
}

export type LinkedInFetchErrorCode = 'invalid_url' | 'not_found' | 'rate_limit' | 'login_wall' | 'too_short' | 'network'

export class LinkedInFetchError extends Error {
  constructor(
    message: string,
    readonly code: LinkedInFetchErrorCode,
  ) {
    super(message)
    this.name = 'LinkedInFetchError'
  }
}

/** Fetch public LinkedIn profile text server-side. Fails gracefully for private/login-walled profiles. */
export async function fetchLinkedInProfileText(profileUrl: string): Promise<string> {
  const normalized = normalizeLinkedInProfileUrl(profileUrl)
  if (!normalized) {
    throw new LinkedInFetchError(
      'Enter a valid LinkedIn profile URL (linkedin.com/in/your-name)',
      'invalid_url',
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(normalized, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    })

    if (res.status === 404) {
      throw new LinkedInFetchError('Profile not found — paste your profile text instead.', 'not_found')
    }
    if (res.status === 429) {
      throw new LinkedInFetchError('LinkedIn rate limit — wait a minute or paste text manually.', 'rate_limit')
    }
    if (!res.ok) {
      throw new LinkedInFetchError('Could not load profile — paste your profile text instead.', 'network')
    }

    const finalUrl = res.url.toLowerCase()
    if (!finalUrl.includes('linkedin.com/in/')) {
      throw new LinkedInFetchError(
        'Profile is private or requires login — paste your profile text (Ctrl+A on your profile page).',
        'login_wall',
      )
    }

    const html = await res.text()

    if (looksLikeLoginWall(html)) {
      throw new LinkedInFetchError(
        'Profile is private or requires login — paste your profile text (Ctrl+A on your profile page).',
        'login_wall',
      )
    }

    const text = extractProfileText(html)
    if (text.length < 80) {
      throw new LinkedInFetchError(
        'Could not extract enough profile text — paste your full profile manually.',
        'too_short',
      )
    }

    return text
  } catch (err) {
    if (err instanceof LinkedInFetchError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new LinkedInFetchError('LinkedIn took too long — paste your profile text instead.', 'network')
    }
    throw new LinkedInFetchError('Could not load profile — paste your profile text instead.', 'network')
  } finally {
    clearTimeout(timer)
  }
}
