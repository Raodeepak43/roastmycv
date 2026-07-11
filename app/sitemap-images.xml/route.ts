import { getImageSitemapEntries } from '@/lib/sitemap/entries'
import { SITEMAP_XML_HEADERS, toImageUrlset } from '@/lib/sitemap/xml'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  return new Response(toImageUrlset(getImageSitemapEntries()), { headers: SITEMAP_XML_HEADERS })
}
