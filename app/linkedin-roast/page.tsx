import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { LinkedInRoastApp } from '@/components/linkedin-roast/LinkedInRoastApp'

export const metadata: Metadata = pageMetadata({
  title: 'LinkedIn Roast — Free AI LinkedIn Profile Review | MyCVRoast',
  description:
    'Roast your LinkedIn profile with AI. Brutally honest feedback on headline, about, experience, skills and activity. Free — no signup.',
  path: '/linkedin-roast',
  keywords: 'linkedin roast, linkedin profile review, linkedin profile roast, ai linkedin audit',
})

export default function LinkedInRoastPage() {
  return <LinkedInRoastApp />
}
