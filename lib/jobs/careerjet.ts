export type CareerjetJob = {
  title: string
  company: string
  date: string
  description: string
  locations: string
  salary: string | null
  site: string
  url: string
}

export type CareerjetSearchResult = {
  jobs: CareerjetJob[]
  total: number
  pages: number
  page: number
  pageSize: number
}

export type JobCountry = {
  label: string
  localeCode: string
}

export const JOB_COUNTRIES: JobCountry[] = [
  { label: 'India', localeCode: 'en_IN' },
  { label: 'United States', localeCode: 'en_US' },
  { label: 'United Kingdom', localeCode: 'en_GB' },
  { label: 'Canada', localeCode: 'en_CA' },
  { label: 'Australia', localeCode: 'en_AU' },
  { label: 'UAE', localeCode: 'en_AE' },
  { label: 'Singapore', localeCode: 'en_SG' },
  { label: 'Germany', localeCode: 'de_DE' },
  { label: 'France', localeCode: 'fr_FR' },
]

export const JOB_POSTED_OPTIONS = [
  { value: 'any', label: 'Any time', sort: 'relevance' },
  { value: 'recent', label: 'Most recent', sort: 'date' },
  { value: 'salary', label: 'Highest salary', sort: 'salary' },
] as const

export const JOB_EMPLOYMENT_OPTIONS = [
  { value: 'any', label: 'Any type' },
  { value: 'fulltime', label: 'Full-time', workHours: 'f' },
  { value: 'parttime', label: 'Part-time', workHours: 'p' },
  { value: 'contract', label: 'Contract', contractType: 'c' },
  { value: 'internship', label: 'Internship', contractType: 'i' },
] as const

export const JOB_EXPERIENCE_OPTIONS = [
  { value: 'any', label: 'Any level' },
  { value: 'entry', label: 'Entry / fresher', keyword: 'fresher OR entry level' },
  { value: 'mid', label: 'Mid-level', keyword: '2-5 years experience' },
  { value: 'senior', label: 'Senior', keyword: 'senior' },
] as const

const API_ENDPOINT = 'https://search.api.careerjet.net/v4/query'

type RawJob = {
  title?: string
  company?: string
  date?: string
  description?: string
  locations?: string
  salary?: string
  site?: string
  url?: string
}

type RawResponse = {
  type?: string
  error?: string
  hits?: number
  pages?: number
  jobs?: RawJob[]
}

export type CareerjetSearchInput = {
  keywords: string
  location?: string
  localeCode?: string
  page?: number
  pageSize?: number
  sort?: string
  contractType?: string
  workHours?: string
  remoteOnly?: boolean
  experienceKeyword?: string
  userIp: string
  userAgent: string
  referrerUrl: string
}

function getApiKey(): string {
  const key = process.env.CAREERJET_API_KEY?.trim()
  if (!key) throw new Error('CAREERJET_API_KEY is not configured on the server.')
  return key
}

function buildKeywords(input: CareerjetSearchInput): string {
  const parts = [input.keywords.trim()]
  if (input.remoteOnly) parts.push('remote')
  if (input.experienceKeyword) parts.push(input.experienceKeyword)
  return parts.filter(Boolean).join(' ')
}

export async function searchCareerjetJobs(input: CareerjetSearchInput): Promise<CareerjetSearchResult> {
  const apiKey = getApiKey()
  const page = Math.min(Math.max(input.page ?? 1, 1), 10)
  const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 50)

  const params = new URLSearchParams({
    locale_code: input.localeCode || 'en_IN',
    keywords: buildKeywords(input),
    user_ip: input.userIp,
    user_agent: input.userAgent,
    url: input.referrerUrl,
    page: String(page),
    page_size: String(pageSize),
    sort: input.sort || 'relevance',
    fragment_size: '220',
  })

  if (input.location?.trim()) params.set('location', input.location.trim())
  if (input.contractType) params.set('contract_type', input.contractType)
  if (input.workHours) params.set('work_hours', input.workHours)

  const auth = Buffer.from(`${apiKey}:`).toString('base64')
  const res = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Referer: input.referrerUrl,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  const data = (await res.json()) as RawResponse

  if (data.type === 'ERROR' || data.error) {
    const message = data.error || 'Careerjet API error'
    if (/unauthorized access from ip/i.test(message)) {
      throw new Error(
        'Careerjet blocked this server IP. Register at careerjet.com/partners, whitelist your server outbound IP (run npm run jobs:careerjet-ip locally), then retry.',
      )
    }
    throw new Error(message)
  }

  const jobs: CareerjetJob[] = (data.jobs ?? []).map((job) => ({
    title: job.title?.trim() || 'Untitled role',
    company: job.company?.trim() || 'Company not listed',
    date: job.date?.trim() || '',
    description: job.description?.trim() || '',
    locations: job.locations?.trim() || '',
    salary: job.salary?.trim() || null,
    site: job.site?.trim() || '',
    url: job.url?.trim() || '',
  }))

  const total = data.hits ?? jobs.length
  const pages = data.pages ?? Math.max(1, Math.ceil(total / pageSize))

  return { jobs, total, pages, page, pageSize }
}
