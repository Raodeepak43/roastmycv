import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  } catch {
    // optional
  }
}

loadEnvLocal()

const key = process.env.CAREERJET_API_KEY?.trim()
if (!key) {
  console.error('CAREERJET_API_KEY not set')
  process.exit(1)
}

const ip = '122.164.126.52'
const params = new URLSearchParams({
  locale_code: 'en_IN',
  keywords: 'software developer',
  location: 'Bangalore',
  user_ip: ip,
  user_agent: 'MyCVRoast/1.0',
  page_size: '3',
})

const auth = Buffer.from(`${key}:`).toString('base64')
const res = await fetch(`https://search.api.careerjet.net/v4/query?${params}`, {
  headers: {
    Authorization: `Basic ${auth}`,
    Referer: 'https://www.mycvroast.in/career-tools/jobs',
  },
})

const data = await res.json()
if (data.type === 'ERROR' || data.error) {
  console.error('Careerjet error:', data.error || data)
  process.exit(1)
}

console.log(`OK — ${data.hits ?? 0} jobs. Sample: ${data.jobs?.[0]?.title ?? 'none'}`)
