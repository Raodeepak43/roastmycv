import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import { toolMeta } from '@/lib/tools/dashboard/config'

export interface UserToolResultRow {
  id: string
  user_id: string
  tool_slug: string
  title: string | null
  input_summary: string | null
  result_text: string
  result_data: Record<string, unknown> | null
  created_at: string
}

async function admin() {
  if (!isSupabaseConfigured()) return null
  return getSupabaseAdmin()
}

export function createToolResultId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

/** Turn API payloads into readable markdown for history + display. */
export function payloadToHistoryText(payload: unknown): string {
  if (typeof payload === 'string') return payload.trim()
  if (!payload || typeof payload !== 'object') return String(payload ?? '')

  const p = payload as Record<string, unknown>
  if (typeof p.result === 'string' && p.result.trim()) return p.result.trim()

  const parts: string[] = []

  if (typeof p.summary === 'string' && p.summary.trim()) {
    parts.push(`## Summary\n\n${p.summary.trim()}`)
  }
  if (typeof p.overallScore === 'number') {
    parts.push(`## Score\n\n**${p.overallScore}/10**`)
  }
  if (Array.isArray(p.top_mistakes) && p.top_mistakes.length) {
    parts.push(`## What went wrong\n\n${(p.top_mistakes as string[]).map((m) => `- ${m}`).join('\n')}`)
  }
  if (Array.isArray(p.improvement_tips) && p.improvement_tips.length) {
    parts.push(`## How to improve\n\n${(p.improvement_tips as string[]).map((t) => `- ${t}`).join('\n')}`)
  }
  if (typeof p.verdict === 'string') {
    parts.push(`## Verdict\n\n**${p.verdict}**${p.confidence ? ` (${p.confidence} confidence)` : ''}`)
  }
  if (typeof p.explanation === 'string') {
    parts.push(`## Explanation\n\n${p.explanation}`)
  }
  if (typeof p.advice === 'string') {
    parts.push(`## Advice\n\n${p.advice}`)
  }
  if (Array.isArray(p.redFlags) && p.redFlags.length) {
    parts.push(`## Red flags\n\n${p.redFlags.map((f) => `- ${String(f)}`).join('\n')}`)
  }
  if (Array.isArray(p.flags) && p.flags.length) {
    const rows = p.flags as { type?: string; found?: string; risk?: string; neutralise?: string }[]
    parts.push(
      '## Flags\n\n| Type | Found | Risk | How to fix |\n| --- | --- | --- | --- |\n' +
        rows
          .map(
            (f) =>
              `| ${f.type ?? ''} | ${f.found ?? ''} | ${f.risk ?? ''} | ${f.neutralise ?? ''} |`,
          )
          .join('\n'),
    )
  }
  if (Array.isArray(p.rows) && p.rows.length) {
    const rows = p.rows as { original?: string; rewritten?: string }[]
    parts.push(
      '## Rewritten bullets\n\n' +
        rows.map((r, i) => `### ${i + 1}. Before\n${r.original ?? ''}\n\n**After:** ${r.rewritten ?? ''}`).join('\n\n'),
    )
  }
  if (Array.isArray(p.principles) && p.principles.length) {
    parts.push(`## Tips\n\n${(p.principles as string[]).map((t) => `- ${t}`).join('\n')}`)
  }
  if (typeof p.compressedCv === 'string' && p.compressedCv.trim()) {
    parts.push(`## Compressed CV\n\n${p.compressedCv.trim()}`)
  }

  if (parts.length) return parts.join('\n\n')

  return `## Results\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``
}

export async function saveToolResult(input: {
  userId: string
  toolSlug: ToolSlug
  resultText: string
  title?: string
  inputSummary?: string
  resultData?: Record<string, unknown>
}): Promise<UserToolResultRow | null> {
  const sb = await admin()
  if (!sb) return null

  const label = input.title ?? toolMeta(input.toolSlug).label
  const { data, error } = await sb
    .from('user_tool_results')
    .insert({
      id: createToolResultId(),
      user_id: input.userId,
      tool_slug: input.toolSlug,
      title: label,
      input_summary: input.inputSummary?.slice(0, 200) ?? null,
      result_text: input.resultText.slice(0, 120000),
      result_data: input.resultData ?? null,
    })
    .select('*')
    .single()

  if (error) {
    console.error('[saveToolResult]', error.code, error.message)
    return null
  }
  return data as UserToolResultRow
}

export async function listToolResults(
  userId: string,
  opts?: { toolSlug?: ToolSlug; limit?: number },
): Promise<UserToolResultRow[]> {
  const sb = await admin()
  if (!sb) return []

  let query = sb
    .from('user_tool_results')
    .select('id, tool_slug, title, input_summary, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 20)

  if (opts?.toolSlug) {
    query = query.eq('tool_slug', opts.toolSlug)
  }

  const { data, error } = await query
  if (error) {
    console.error('[listToolResults]', error.message)
    return []
  }
  return (data ?? []) as UserToolResultRow[]
}

export async function getToolResult(userId: string, id: string): Promise<UserToolResultRow | null> {
  const sb = await admin()
  if (!sb) return null

  const { data, error } = await sb
    .from('user_tool_results')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return data as UserToolResultRow
}

export async function listAllToolResultsForUser(userId: string, limit = 50): Promise<UserToolResultRow[]> {
  const sb = await admin()
  if (!sb) return []

  const { data, error } = await sb
    .from('user_tool_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data ?? []) as UserToolResultRow[]
}
