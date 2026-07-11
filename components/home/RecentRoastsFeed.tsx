'use client'

import { useEffect, useState } from 'react'
import { MotionFadeUp } from '@/components/Motion'

export function RecentRoastsFeed() {
  const [items, setItems] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/signups', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items.slice(0, 4) : []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || items.length === 0) return null

  return (
    <section aria-label="Recent resume roasts" className="mt-10 md:mt-14">
      <p className="section-label mb-3">
        <span aria-hidden>🔥</span> RECENT ROASTS
      </p>
      <MotionFadeUp className="neo-frame neo-frame--soft border-border p-4 md:p-5">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="font-body text-[13px] md:text-sm text-dim">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-body text-[11px] text-muted">Live activity from real uploads on MyCVRoast.</p>
      </MotionFadeUp>
    </section>
  )
}
