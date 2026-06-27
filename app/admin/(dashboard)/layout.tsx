import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell dark" style={{ minHeight: '100vh' }}>
      <div className="admin-app">
        <AdminSidebar />
        <div className="admin-main">{children}</div>
      </div>
    </div>
  )
}
