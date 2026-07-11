import type { Metadata } from 'next'
import { JobSearchPortal } from '@/components/jobs/JobSearchPortal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Job Search Portal — Find Roles & Match Your CV | MyCVRoast',
  description:
    'Search live job listings in India and abroad via Careerjet. Find roles, apply smarter, then roast or match your CV before you send applications.',
  path: '/career-tools/jobs',
  keywords: 'job search india, find jobs online, careerjet jobs, job portal india, software developer jobs',
})

export default function JobSearchPage() {
  return <JobSearchPortal />
}
