'use client'

import { Suspense } from 'react'
import { Component as AnimatedLogin } from '@/components/ui/animated-characters-login-page'

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="shadcn-login-theme min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <AnimatedLogin />
    </Suspense>
  )
}
