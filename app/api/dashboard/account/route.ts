import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { deleteUserAccount } from '@/lib/dashboard/user-data'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Account deletion is not available' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const confirm = (body as Record<string, unknown>).confirm
  if (confirm !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm account deletion' }, { status: 400 })
  }

  try {
    const cookieResponse = NextResponse.json({ ok: true })
    const supabase = createRouteHandlerClient(cookieResponse)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleted = await deleteUserAccount(user.id, user.email)
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    await supabase.auth.signOut()

    const response = NextResponse.json({ ok: true })
    cookieResponse.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value)
    })
    return response
  } catch (err) {
    console.error('[dashboard/account DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
