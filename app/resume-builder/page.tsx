import type { Metadata } from 'next'
import { PublicResumeBuilder } from '@/components/resume-builder/PublicResumeBuilder'
import { pageMetadata } from '@/lib/seo'
import './resume-builder.css'

export const metadata: Metadata = pageMetadata({
  title: 'Free Resume Builder India — ATS CV Maker Online | MyCVRoast',
  description:
    'Free resume builder & CV maker for India — create resume online free, ATS-friendly templates, live score, PDF export. Best for freshers, campus placement & job applications. No download paywall.',
  path: '/resume-builder',
  keywords:
    'free resume builder, free resume builder india, resume builder for freshers, cv maker free, online cv maker, create resume online free, indian resume builder, resume maker online free, ats resume builder free, build your resume for free',
})

export default function ResumeBuilderPage() {
  return <PublicResumeBuilder />
}
