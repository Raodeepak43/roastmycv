import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
