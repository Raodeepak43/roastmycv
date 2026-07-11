'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardHistoryPanel } from '@/components/dashboard/DashboardHistoryPanel'
import { DashboardToolHistoryPanel } from '@/components/dashboard/DashboardToolHistoryPanel'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'

export default function DashboardHistoryPage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') === 'tools' ? 'tools' : 'roasts'

  return (
    <>
      <DashboardPageHeader
        title="History"
        description={
          tab === 'tools'
            ? 'Past AI tool runs — Skills Gap, LinkedIn, Job Match, and more.'
            : 'Every roast you run while signed in is saved here.'
        }
      />

      <div className="mb-5 flex gap-2">
        <Link
          href="/dashboard/history"
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'roasts' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-900'
          }`}
        >
          Roasts
        </Link>
        <Link
          href="/dashboard/history?tab=tools"
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'tools' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-900'
          }`}
        >
          AI tools
        </Link>
      </div>

      {tab === 'tools' ? <DashboardToolHistoryPanel /> : <DashboardHistoryPanel embedded />}
    </>
  )
}
