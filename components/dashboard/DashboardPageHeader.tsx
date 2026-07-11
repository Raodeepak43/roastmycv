interface DashboardPageHeaderProps {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
}

/** Optional in-page intro below the shell topbar. */
export function DashboardPageHeader({ title: _title, description, action }: DashboardPageHeaderProps) {
  if (!description && !action) return null

  return (
    <div className="dash-page-intro">
      {description && <p className="dash-page-intro__desc">{description}</p>}
      {action && <div className="dash-page-intro__action">{action}</div>}
    </div>
  )
}
