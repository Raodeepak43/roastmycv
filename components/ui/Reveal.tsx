'use client'

import { useEffect, useRef } from 'react'

type RevealDirection = 'up' | 'left' | 'right'

export function Reveal({
  children,
  className = '',
  direction = 'up',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  direction?: RevealDirection
  as?: 'div' | 'section' | 'article'
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    el.classList.add('reveal', `reveal-${direction}`)
    observer.observe(el)
    return () => observer.disconnect()
  }, [direction])

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}
