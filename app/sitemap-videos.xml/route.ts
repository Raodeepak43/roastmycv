import { getVideoSitemapEntries } from '@/lib/sitemap/entries'
import { SITEMAP_XML_HEADERS, toVideoUrlset } from '@/lib/sitemap/xml'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  return new Response(toVideoUrlset(getVideoSitemapEntries()), { headers: SITEMAP_XML_HEADERS })
}
