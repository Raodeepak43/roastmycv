import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { enforceToolAccess, recordToolUse } from '@/lib/tools/dashboard/usage'
import type { ToolSlug } from '@/lib/tools/dashboard/config'
import { hasAnthropicKey } from '@/lib/tools/dashboard/llm'
import { payloadToHistoryText, saveToolResult } from '@/lib/dashboard/tool-results'

export type ToolSavePayload = {
  result: unknown
  inputSummary?: string
  title?: string
}

export async function requireToolUser(toolSlug: ToolSlug) {
  const supabase = createRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) }
  }

  if (!hasAnthropicKey()) {
    return { error: NextResponse.json({ error: 'AI service unavailable' }, { status: 503 }) }
  }

  const gate = await enforceToolAccess(user.id, toolSlug)
  if (gate.allowed === false) {
    return {
      error: NextResponse.json(
        { error: gate.error, isPro: gate.isPro, used: gate.used, limit: gate.limit },
        { status: gate.status },
      ),
    }
  }

  return { user, gate }
}

export async function finishToolUse(
  userId: string,
  toolSlug: ToolSlug,
  isPro: boolean,
  save?: ToolSavePayload,
) {
  await recordToolUse(userId, toolSlug, isPro)

  if (!save?.result) return

  const resultText = payloadToHistoryText(save.result)
  if (!resultText.trim()) return

  const resultData =
    typeof save.result === 'object' && save.result !== null && !Array.isArray(save.result)
      ? (save.result as Record<string, unknown>)
      : undefined

  await saveToolResult({
    userId,
    toolSlug,
    resultText,
    title: save.title,
    inputSummary: save.inputSummary,
    resultData,
  })
}

export function cvTooShort(cv: unknown): boolean {
  return typeof cv !== 'string' || cv.trim().length < 50
}

/** Keep tool prompts within serverless time limits on Vercel Hobby/Pro. */
export function trimCvForTool(cv: string, maxChars = 7000): string {
  const trimmed = cv.trim()
  if (trimmed.length <= maxChars) return trimmed
  return `${trimmed.slice(0, maxChars)}\n\n[CV trimmed for analysis — key sections only]`
}
