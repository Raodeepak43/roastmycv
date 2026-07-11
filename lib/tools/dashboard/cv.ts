import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export interface SavedDashboardCv {
  text: string
  fileName: string | null
  source: string
  updatedAt: string | null
}

/** Latest CV text for AI tools — explicit save, then last roast, then null. */
export async function getSavedDashboardCv(userId: string): Promise<SavedDashboardCv | null> {
  if (!isSupabaseConfigured()) return null
  const sb = getSupabaseAdmin()

  try {
    const { data: saved, error } = await sb
      .from('user_saved_cv')
      .select('cv_text, file_name, source, updated_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (!error && saved?.cv_text) {
      const text = saved.cv_text.trim()
      if (text.length >= 50) {
        return {
          text,
          fileName: saved.file_name ?? null,
          source: saved.source ?? 'upload',
          updatedAt: saved.updated_at ?? null,
        }
      }
    }
  } catch {
    /* table may not exist yet */
  }

  const roastCv = await getLatestRoastCvText(userId)
  if (roastCv) {
    return {
      text: roastCv.text,
      fileName: roastCv.fileName,
      source: 'roast',
      updatedAt: roastCv.updatedAt,
    }
  }

  return null
}

/** @deprecated use getSavedDashboardCv */
export async function getLatestSavedCvText(userId: string): Promise<string | null> {
  const saved = await getSavedDashboardCv(userId)
  return saved?.text ?? null
}

async function getLatestRoastCvText(userId: string): Promise<{
  text: string
  fileName: string | null
  updatedAt: string | null
} | null> {
  const sb = getSupabaseAdmin()
  const { data } = await sb
    .from('user_roasts')
    .select('roast_data, file_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.roast_data) return null
  const roastData = data.roast_data as { resumeText?: string }
  const text = roastData.resumeText?.trim()
  if (!text || text.length < 50) return null
  return {
    text,
    fileName: data.file_name ?? null,
    updatedAt: data.created_at ?? null,
  }
}

export async function saveDashboardCv(
  userId: string,
  cvText: string,
  opts?: { fileName?: string | null; source?: string },
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const text = cvText.trim()
  if (text.length < 50) return false

  const sb = getSupabaseAdmin()
  const { error } = await sb.from('user_saved_cv').upsert(
    {
      user_id: userId,
      cv_text: text,
      file_name: opts?.fileName ?? null,
      source: opts?.source ?? 'upload',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    console.warn('[saveDashboardCv]', error.message)
    return false
  }

  return true
}
