import type { Metadata } from 'next'
import { ResumeBuilderApp } from '@/components/resume-builder/ResumeBuilderApp'

export const metadata: Metadata = {
  title: 'Free ATS Resume Builder — Amazon Ready | MyCVRoast',
  description:
    'Build ATS-friendly resume that passes Amazon, Google, Flipkart screening. Free, AI-powered bullet strengthener included.',
  alternates: { canonical: 'https://mycvroast.in/resume-builder' },
  openGraph: {
    title: 'Free ATS Resume Builder — Amazon Ready',
    description:
      'Build ATS-friendly resume that passes Amazon, Google, Flipkart screening. Free AI bullet strengthener.',
    url: 'https://mycvroast.in/resume-builder',
  },
}

export default function ResumeBuilderPage() {
  return <ResumeBuilderApp />
}
