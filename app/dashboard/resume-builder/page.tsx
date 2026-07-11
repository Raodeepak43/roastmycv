import { ResumeBuilderApp } from '@/components/resume-builder/ResumeBuilderApp'
import '@/components/resume-builder/wizard/wizard.css'

export const metadata = {
  title: 'Resume Builder | Dashboard | MyCVRoast',
  robots: { index: false, follow: false },
}

export default function DashboardResumeBuilderPage() {
  return <ResumeBuilderApp embedded />
}
