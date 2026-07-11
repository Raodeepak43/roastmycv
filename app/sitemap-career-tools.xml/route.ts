import { getCareerToolsSitemapEntries } from '@/lib/sitemap/entries'
import { SITEMAP_XML_HEADERS, toUrlset } from '@/lib/sitemap/xml'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  return new Response(toUrlset(getCareerToolsSitemapEntries()), { headers: SITEMAP_XML_HEADERS })
}
