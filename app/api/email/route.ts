import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    let body: { email?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const email = body.email?.trim().toLowerCase()
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('email_signups').insert({ email })
      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ ok: true, duplicate: true })
        }
        console.error('Supabase email insert:', error)
        return NextResponse.json({ error: 'Could not save email' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json(
      { error: 'Storage not configured — add Supabase env vars on Vercel' },
      { status: 503 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not save email' }, { status: 500 })
  }
}
