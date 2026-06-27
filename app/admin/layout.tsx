import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './admin.css'
import './shadcn-login.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Admin | MyCVRoast',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>
}
