import { generateLlmsTxt, LLMS_TXT_HEADERS } from '@/lib/llms/generate'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  return new Response(generateLlmsTxt(), { headers: LLMS_TXT_HEADERS })
}
