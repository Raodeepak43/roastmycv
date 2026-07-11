import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default function AdminHomePage() {
  return (
    <>
      <AdminHeader title="Dashboard" description="Users, revenue, and site metrics" />
      <main className="admin-page">
        <AdminDashboard />
      </main>
    </>
  )
}
