import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')

    if (!isPdf && !isTxt) {
      return NextResponse.json({ error: 'PDF ya TXT file upload karo' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let text = ''

    if (isPdf) {
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Resume se text nahi nikla, doosri file try karo' }, { status: 400 })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (err) {
    console.error('Parse error:', err)
    return NextResponse.json({ error: 'Kuch gadbad ho gayi, dobara try karo' }, { status: 500 })
  }
}
