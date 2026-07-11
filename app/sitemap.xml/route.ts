import { getSitemapIndexEntries } from '@/lib/sitemap/entries'
import { SITEMAP_XML_HEADERS, toSitemapIndex } from '@/lib/sitemap/xml'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  return new Response(toSitemapIndex(getSitemapIndexEntries()), { headers: SITEMAP_XML_HEADERS })
}
