'use client'

import { useState } from 'react'
import { userInitials } from '@/lib/auth/avatar'

const SIZE_CLASS = {
  sm: 'size-8 rounded-full text-xs',
  md: 'size-10 rounded-full text-[13px]',
  lg: 'size-16 rounded-2xl text-2xl',
} as const

type DashboardUserAvatarProps = {
  name: string
  email: string
  avatarUrl?: string | null
  size?: keyof typeof SIZE_CLASS
  className?: string
}

export function DashboardUserAvatar({
  name,
  email,
  avatarUrl,
  size = 'sm',
  className = '',
}: DashboardUserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(avatarUrl) && !imageFailed
  const sizeClass = SIZE_CLASS[size]

  if (showImage && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`shrink-0 object-cover ${sizeClass} ${className}`.trim()}
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-[#fff4ed] font-semibold text-[#ff4500] ${sizeClass} ${className}`.trim()}
      aria-hidden
    >
      {userInitials(name, email)}
    </span>
  )
}
