'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STYLES = `
.cinematic-footer-wrapper {
  font-family: Syne, sans-serif;
  -webkit-font-smoothing: antialiased;
  --foreground: #ffffff;
  --background: #000000;
  --primary: #ff4500;
  --secondary: #f5c542;
  --destructive: #ff4500;
  --muted-foreground: #888888;
  --border: #1a1a1a;
  --pill-bg-1: color-mix(in srgb, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in srgb, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in srgb, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in srgb, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in srgb, var(--background) 80%, transparent);
  --pill-border: color-mix(in srgb, var(--foreground) 8%, transparent);
  --pill-bg-1-hover: color-mix(in srgb, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in srgb, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in srgb, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in srgb, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in srgb, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in srgb, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in srgb, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }
.animate-footer-heartbeat { animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--primary) 15%, transparent) 0%,
    color-mix(in srgb, var(--secondary) 10%, transparent) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.footer-giant-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: clamp(7rem, 24vw, 15rem);
  padding: 0 clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2vh, 1.5rem);
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}

.footer-giant-bg-text {
  font-size: clamp(3.5rem, 14vw, 11rem);
  line-height: 0.92;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
  transform-origin: center bottom;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.36) 0%,
    rgba(255, 255, 255, 0.14) 48%,
    rgba(255, 255, 255, 0.04) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 0 40px rgba(255, 69, 0, 0.08));
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in srgb, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in srgb, var(--foreground) 15%, transparent));
}
`

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType
  }

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = 'button', ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (typeof window === 'undefined') return
      const element = localRef.current
      if (!element) return

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect()
          const h = rect.width / 2
          const w = rect.height / 2
          const x = e.clientX - rect.left - h
          const y = e.clientY - rect.top - w

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: 'power2.out',
            duration: 0.4,
          })
        }

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: 'elastic.out(1, 0.3)',
            duration: 1.2,
          })
        }

        element.addEventListener('mousemove', handleMouseMove as EventListener)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
          element.removeEventListener('mousemove', handleMouseMove as EventListener)
          element.removeEventListener('mouseleave', handleMouseLeave)
        }
      }, element)

      return () => ctx.revert()
    }, [])

    return (
      <Component
        ref={(node: HTMLElement) => {
          ;(localRef as React.MutableRefObject<HTMLElement | null>).current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node
        }}
        className={cn('cursor-pointer', className)}
        {...props}
      >
        {children}
      </Component>
    )
  },
)
MagneticButton.displayName = 'MagneticButton'

const MARQUEE_ITEMS = [
  'AI Resume Roast',
  'Brutal Honest Feedback',
  '15 Languages',
  '5 Free Roasts',
  'Zero Sympathy',
  'High Voltage Roasts',
]

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    {MARQUEE_ITEMS.map((item, i) => (
      <React.Fragment key={item}>
        <span>{item}</span>
        <span className={i % 2 === 0 ? 'text-orange/60' : 'text-gold/60'}>✦</span>
      </React.Fragment>
    ))}
  </div>
)

function GiantBrandText({
  text,
  textRef,
}: {
  text: string
  textRef: React.RefObject<HTMLDivElement | null>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const wrap = wrapRef.current
    const measure = measureRef.current
    if (!wrap || !measure) return

    const fit = () => {
      const maxW = wrap.clientWidth
      const contentW = measure.scrollWidth
      if (maxW <= 0 || contentW <= 0) return
      setScale(Math.min(1, maxW / contentW))
    }

    fit()
    void document.fonts.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    ro.observe(measure)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [text])

  return (
    <div ref={textRef} className="footer-giant-wrap">
      <div
        ref={measureRef}
        className="footer-giant-bg-text"
        style={{ transform: `scale(${scale})` }}
      >
        {text}
      </div>
    </div>
  )
}

export type CinematicFooterProps = {
  brandName?: string
  tagline?: string
  supportSlot?: React.ReactNode
  /** Show CTA content immediately — use on short pages like /roast/[id] */
  instant?: boolean
}

export function CinematicFooter({
  brandName = 'MyCVRoast',
  tagline = 'No account needed · Made with ❤️ by an Indian',
  supportSlot,
  instant = false,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const giantTextRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !wrapperRef.current) return

    const ctx = gsap.context(() => {
      if (instant) {
        gsap.set([giantTextRef.current, headingRef.current, linksRef.current], {
          opacity: 1,
          y: 0,
          scale: 1,
        })
        return
      }

      gsap.fromTo(
        giantTextRef.current,
        { y: '10vh', scale: 0.8, opacity: 0 },
        {
          y: '0vh',
          scale: 1,
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 40%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )
    }, wrapperRef)

    return () => ctx.revert()
  }, [instant])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className={instant ? 'relative w-full min-h-screen' : 'relative h-screen w-full'}
        style={instant ? undefined : { clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      >
        <footer className={`${instant ? 'relative' : 'fixed bottom-0 left-0'} flex h-screen w-full flex-col justify-between overflow-hidden bg-page text-white cinematic-footer-wrapper`}>
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          <GiantBrandText text={brandName} textRef={giantTextRef} />

          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-border/50 bg-page/60 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-dim uppercase font-body">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-4xl md:text-7xl font-black footer-text-glow tracking-tighter mb-10 md:mb-12 text-center"
            >
              Ready for your roast?
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  as={Link}
                  href="/"
                  className="footer-glass-pill px-8 py-4 rounded-full text-white font-bold text-sm md:text-base"
                >
                  🔥 Roast My CV
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/blog"
                  className="footer-glass-pill px-8 py-4 rounded-full text-white font-bold text-sm md:text-base"
                >
                  📖 Blog
                </MagneticButton>
              </div>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full mt-2">
                <MagneticButton
                  as="a"
                  href="https://www.producthunt.com/products/get-brutally-honest-feedback"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-6 py-3 rounded-full text-dim font-medium text-xs md:text-sm hover:text-white"
                >
                  Product Hunt
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="https://x.com/mycvroast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-6 py-3 rounded-full text-dim font-medium text-xs md:text-sm hover:text-white"
                >
                  X / Twitter
                </MagneticButton>
                {supportSlot ? (
                  <div className="footer-glass-pill px-2 py-1 rounded-full inline-flex items-center">
                    {supportSlot}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-dim text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1 font-body">
              © {new Date().getFullYear()} MyCVRoast
            </div>

            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50">
              <span className="text-dim text-[10px] md:text-xs font-bold uppercase tracking-widest font-body">
                {tagline}
              </span>
            </div>

            <MagneticButton
              as="button"
              type="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-dim hover:text-white group order-3"
              aria-label="Back to top"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  )
}

export { MagneticButton }
