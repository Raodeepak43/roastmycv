import { getBlogSitemapEntries } from '@/lib/sitemap/entries'
import { SITEMAP_XML_HEADERS, toUrlset } from '@/lib/sitemap/xml'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  return new Response(toUrlset(getBlogSitemapEntries()), { headers: SITEMAP_XML_HEADERS })
}
