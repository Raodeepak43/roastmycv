'use client'

import { createContext, useContext, useState } from 'react'

interface DashboardUser {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  authProvider: string
  setName: (name: string) => void
}

const DashboardUserContext = createContext<DashboardUser>({
  userId: '',
  name: 'User',
  email: '',
  avatarUrl: null,
  authProvider: 'email',
  setName: () => {},
})

export function DashboardUserProvider({
  userId,
  name: initialName,
  email,
  avatarUrl,
  authProvider,
  children,
}: {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  authProvider: string
  children: React.ReactNode
}) {
  const [name, setName] = useState(initialName)

  return (
    <DashboardUserContext.Provider value={{ userId, name, email, avatarUrl, authProvider, setName }}>
      {children}
    </DashboardUserContext.Provider>
  )
}

export function useDashboardUser() {
  return useContext(DashboardUserContext)
}
