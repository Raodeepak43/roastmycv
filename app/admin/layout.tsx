import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'
import './admin.css'
import './shadcn-login.css'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: {
    ...NOINDEX_ROBOTS,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
