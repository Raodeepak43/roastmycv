import { UserDashboardOverview } from '@/components/dashboard/UserDashboardOverview'

export const metadata = {
  title: 'Dashboard | MyCVRoast',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <UserDashboardOverview />
}
