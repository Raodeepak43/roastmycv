'use client'

import { useEffect, useRef, useState } from 'react'
import { RevealText } from '@/components/ui/reveal-text'

const LABEL = 'MyCVRoast'

const FOOTER_LETTER_IMAGES = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1491002057636-b23be2566638?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
]

export function FooterWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const wrap = wrapRef.current
    const inner = measureRef.current
    if (!wrap || !inner) return

    const fit = () => {
      const style = getComputedStyle(wrap)
      const padL = parseFloat(style.paddingLeft) || 0
      const padR = parseFloat(style.paddingRight) || 0
      const maxW = wrap.clientWidth - padL - padR
      const contentW = inner.scrollWidth
      if (maxW <= 0 || contentW <= 0) return
      setScale(Math.min(1, maxW / contentW))
    }

    fit()
    void document.fonts.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    ro.observe(inner)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div ref={wrapRef} className="footer-brand-wrap footer-brand-wrap--reveal">
      <div className="footer-brand-reveal-inner">
        <div
          ref={measureRef}
          className="footer-brand-reveal-scale"
          style={{ transform: `scale(${scale})` }}
        >
          <RevealText
            text={LABEL}
            className="font-display items-end justify-start w-full"
            textColor="text-white"
            overlayColor="text-orange"
            fontSize="text-[clamp(3rem,12vw,8rem)]"
            letterDelay={0.06}
            overlayDelay={0.04}
            overlayDuration={0.35}
            springDuration={500}
            letterImages={FOOTER_LETTER_IMAGES}
          />
        </div>
      </div>
    </div>
  )
}
