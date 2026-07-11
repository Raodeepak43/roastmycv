import type { Metadata } from 'next'
import { JobSearchComingSoon } from '@/components/jobs/JobSearchComingSoon'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Job Search Portal — Coming Soon | MyCVRoast',
  description:
    'Live job search inside MyCVRoast is coming soon. Roast your CV, match JDs, and use 29+ career tools while we build the portal.',
  path: '/career-tools/jobs',
  keywords: 'job search india, find jobs online, job portal india',
})

export default function JobSearchPage() {
  return <JobSearchComingSoon />
}
