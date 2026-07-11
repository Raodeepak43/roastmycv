import { NextRequest, NextResponse } from 'next/server'
import {
  JOB_COUNTRIES,
  JOB_EMPLOYMENT_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_POSTED_OPTIONS,
  searchCareerjetJobs,
} from '@/lib/jobs/careerjet'
import { siteUrl } from '@/lib/seo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || '127.0.0.1'
  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const keywords = searchParams.get('keywords')?.trim() || searchParams.get('q')?.trim()

    if (!keywords || keywords.length < 2) {
      return NextResponse.json({ error: 'Enter a job title or keywords (min 2 characters).' }, { status: 400 })
    }

    const country = searchParams.get('country') || 'en_IN'
    const localeCode = JOB_COUNTRIES.find((c) => c.localeCode === country)?.localeCode || country

    const posted = JOB_POSTED_OPTIONS.find((o) => o.value === searchParams.get('posted')) ?? JOB_POSTED_OPTIONS[0]
    const employment =
      JOB_EMPLOYMENT_OPTIONS.find((o) => o.value === searchParams.get('employment')) ?? JOB_EMPLOYMENT_OPTIONS[0]
    const experience =
      JOB_EXPERIENCE_OPTIONS.find((o) => o.value === searchParams.get('experience')) ?? JOB_EXPERIENCE_OPTIONS[0]

    const page = Number(searchParams.get('page') || '1')
    const remoteOnly = searchParams.get('remote') === '1' || searchParams.get('remote') === 'true'

    const result = await searchCareerjetJobs({
      keywords,
      location: searchParams.get('location')?.trim() || undefined,
      localeCode,
      page: Number.isFinite(page) ? page : 1,
      sort: posted.sort,
      contractType: 'contractType' in employment ? employment.contractType : undefined,
      workHours: 'workHours' in employment ? employment.workHours : undefined,
      remoteOnly,
      experienceKeyword: 'keyword' in experience ? experience.keyword : undefined,
      userIp: clientIp(req),
      userAgent: req.headers.get('user-agent') || 'MyCVRoast/1.0',
      referrerUrl: siteUrl('/career-tools/jobs'),
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[jobs/search]', err)
    const message = err instanceof Error ? err.message : 'Job search failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
