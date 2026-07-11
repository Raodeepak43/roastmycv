'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STAGE_W = 550
const STAGE_H = 400

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const frame = useRef<number | null>(null)
  const latest = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      latest.current = { x: e.clientX, y: e.clientY }
      if (frame.current !== null) return
      frame.current = requestAnimationFrame(() => {
        setPos(latest.current)
        frame.current = null
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  return pos
}

function pupilOffset(
  el: DOMRect,
  mouseX: number,
  mouseY: number,
  maxDistance: number,
  force?: { x: number; y: number },
) {
  if (force) return force
  const cx = el.left + el.width / 2
  const cy = el.top + el.height / 2
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.min(Math.hypot(dx, dy), maxDistance)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

interface EyeBallProps {
  mouseX: number
  mouseY: number
  size?: number
  pupilSize?: number
  maxDistance?: number
  isBlinking?: boolean
  forceLook?: { x: number; y: number }
}

function EyeBall({
  mouseX,
  mouseY,
  size = 18,
  pupilSize = 7,
  maxDistance = 5,
  isBlinking = false,
  forceLook,
}: EyeBallProps) {
  const eyeRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!eyeRef.current) return
    const rect = eyeRef.current.getBoundingClientRect()
    setOffset(pupilOffset(rect, mouseX, mouseY, maxDistance, forceLook))
  }, [mouseX, mouseY, maxDistance, forceLook, isBlinking])

  return (
    <div
      ref={eyeRef}
      className="auth-fuse-eye"
      style={{ width: size, height: isBlinking ? 2 : size }}
    >
      {!isBlinking && (
        <div
          className="auth-fuse-pupil"
          style={{
            width: pupilSize,
            height: pupilSize,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          }}
        />
      )}
    </div>
  )
}

interface DotEyeProps {
  mouseX: number
  mouseY: number
  size?: number
  maxDistance?: number
  forceLook?: { x: number; y: number }
}

function DotEye({ mouseX, mouseY, size = 14, maxDistance = 5, forceLook }: DotEyeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setOffset(pupilOffset(rect, mouseX, mouseY, maxDistance, forceLook))
  }, [mouseX, mouseY, maxDistance, forceLook])

  return (
    <div ref={ref} className="auth-fuse-dot-eye" style={{ width: size, height: size }}>
      <div
        className="auth-fuse-dot-pupil"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      />
    </div>
  )
}

function useRandomBlink() {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let inner: ReturnType<typeof setTimeout>

    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true)
        inner = setTimeout(() => {
          setBlinking(false)
          schedule()
        }, 140)
      }, Math.random() * 3500 + 2800)
    }

    schedule()
    return () => {
      clearTimeout(timeout)
      clearTimeout(inner)
    }
  }, [])

  return blinking
}

export interface AuthAnimatedCharactersProps {
  isTyping?: boolean
  passwordLength?: number
  showPassword?: boolean
}

export function AuthAnimatedCharacters({
  isTyping = false,
  passwordLength = 0,
  showPassword = false,
}: AuthAnimatedCharactersProps) {
  const mouse = useMousePosition()
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const tallBlink = useRandomBlink()
  const blackBlink = useRandomBlink()

  const [lookingAtEachOther, setLookingAtEachOther] = useState(false)
  const [isPeeking, setIsPeeking] = useState(false)

  const orangeTallRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const coralRef = useRef<HTMLDivElement>(null)
  const goldRef = useRef<HTMLDivElement>(null)

  const hidingPassword = passwordLength > 0 && !showPassword
  const passwordVisible = passwordLength > 0 && showPassword
  const engaged = isTyping || hidingPassword

  useEffect(() => {
    const el = stageRef.current?.parentElement
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      setScale(Math.min(1, Math.max(0.58, w / STAGE_W)))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (engaged) {
      setLookingAtEachOther(true)
      const t = setTimeout(() => setLookingAtEachOther(false), 900)
      return () => clearTimeout(t)
    }
    setLookingAtEachOther(false)
  }, [engaged])

  useEffect(() => {
    if (!passwordVisible) {
      setIsPeeking(false)
      return
    }

    let peekTimeout: ReturnType<typeof setTimeout>
    let hideTimeout: ReturnType<typeof setTimeout>

    const schedulePeek = () => {
      peekTimeout = setTimeout(() => {
        setIsPeeking(true)
        hideTimeout = setTimeout(() => {
          setIsPeeking(false)
          schedulePeek()
        }, 700)
      }, Math.random() * 2500 + 1800)
    }

    schedulePeek()
    return () => {
      clearTimeout(peekTimeout)
      clearTimeout(hideTimeout)
    }
  }, [passwordVisible])

  const bodyTilt = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, intensity = 1) => {
      if (!ref.current) return { faceX: 0, faceY: 0, skew: 0 }
      const r = ref.current.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 3
      const dx = mouse.x - cx
      const dy = mouse.y - cy
      return {
        faceX: Math.max(-12, Math.min(12, (dx / 22) * intensity)),
        faceY: Math.max(-8, Math.min(8, (dy / 32) * intensity)),
        skew: Math.max(-5, Math.min(5, (-dx / 130) * intensity)),
      }
    },
    [mouse.x, mouse.y],
  )

  const tall = bodyTilt(orangeTallRef)
  const black = bodyTilt(blackRef, 1.15)
  const coral = bodyTilt(coralRef, 0.85)
  const gold = bodyTilt(goldRef, 0.85)

  const lookAway = passwordVisible && !isPeeking
  const peek = passwordVisible && isPeeking

  const tallForce = lookAway
    ? { x: -4, y: -4 }
    : peek
      ? { x: 3, y: 4 }
      : lookingAtEachOther
        ? { x: 3, y: 3 }
        : undefined

  const blackForce = lookAway
    ? { x: -4, y: -4 }
    : lookingAtEachOther
      ? { x: 0, y: -3 }
      : undefined

  const sideForce = lookAway ? { x: -5, y: -4 } : undefined

  return (
    <div className="auth-fuse-characters-stage" aria-hidden="true">
      <div
        ref={stageRef}
        className="auth-fuse-characters-inner"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
        }}
      >
        <div className="auth-fuse-characters-floor" />

        {/* Tall orange — back left */}
        <div
          ref={orangeTallRef}
          className="auth-fuse-char auth-fuse-char--tall"
          style={{
            left: 68,
            width: 176,
            height: engaged ? 420 : 380,
            zIndex: 1,
            transform: passwordVisible
              ? 'skewX(0deg)'
              : engaged
                ? `skewX(${tall.skew - 10}deg) translateX(36px)`
                : `skewX(${tall.skew}deg)`,
          }}
        >
          <div
            className="auth-fuse-face auth-fuse-face--wide"
            style={{
              left: passwordVisible ? 18 : lookingAtEachOther ? 52 : 42 + tall.faceX,
              top: passwordVisible ? 32 : lookingAtEachOther ? 60 : 36 + tall.faceY,
            }}
          >
            <EyeBall mouseX={mouse.x} mouseY={mouse.y} isBlinking={tallBlink} forceLook={tallForce} />
            <EyeBall mouseX={mouse.x} mouseY={mouse.y} isBlinking={tallBlink} forceLook={tallForce} />
          </div>
        </div>

        {/* Black recruiter — center */}
        <div
          ref={blackRef}
          className="auth-fuse-char auth-fuse-char--black"
          style={{
            left: 236,
            width: 118,
            height: 300,
            zIndex: 2,
            transform: passwordVisible
              ? 'skewX(0deg)'
              : lookingAtEachOther
                ? `skewX(${black.skew * 1.4 + 8}deg) translateX(16px)`
                : engaged
                  ? `skewX(${black.skew * 1.35}deg)`
                  : `skewX(${black.skew}deg)`,
          }}
        >
          <div
            className="auth-fuse-face"
            style={{
              left: passwordVisible ? 8 : lookingAtEachOther ? 30 : 24 + black.faceX,
              top: passwordVisible ? 26 : lookingAtEachOther ? 10 : 28 + black.faceY,
            }}
          >
            <EyeBall
              mouseX={mouse.x}
              mouseY={mouse.y}
              size={16}
              pupilSize={6}
              maxDistance={4}
              isBlinking={blackBlink}
              forceLook={blackForce}
            />
            <EyeBall
              mouseX={mouse.x}
              mouseY={mouse.y}
              size={16}
              pupilSize={6}
              maxDistance={4}
              isBlinking={blackBlink}
              forceLook={blackForce}
            />
          </div>
        </div>

        {/* Coral semicircle — front left */}
        <div
          ref={coralRef}
          className="auth-fuse-char auth-fuse-char--coral"
          style={{
            left: 0,
            width: 236,
            height: 196,
            zIndex: 3,
            transform: passwordVisible ? 'skewX(0deg)' : `skewX(${coral.skew}deg)`,
          }}
        >
          <div
            className="auth-fuse-face auth-fuse-face--wide"
            style={{
              left: passwordVisible ? 48 : 78 + coral.faceX,
              top: passwordVisible ? 82 : 86 + coral.faceY,
            }}
          >
            <DotEye mouseX={mouse.x} mouseY={mouse.y} forceLook={sideForce} />
            <DotEye mouseX={mouse.x} mouseY={mouse.y} forceLook={sideForce} />
          </div>
        </div>

        {/* Gold helper — front right */}
        <div
          ref={goldRef}
          className="auth-fuse-char auth-fuse-char--gold"
          style={{
            left: 304,
            width: 136,
            height: 224,
            zIndex: 4,
            transform: passwordVisible ? 'skewX(0deg)' : `skewX(${gold.skew}deg)`,
          }}
        >
          <div
            className="auth-fuse-face"
            style={{
              left: passwordVisible ? 18 : 48 + gold.faceX,
              top: passwordVisible ? 32 : 36 + gold.faceY,
            }}
          >
            <DotEye mouseX={mouse.x} mouseY={mouse.y} forceLook={sideForce} />
            <DotEye mouseX={mouse.x} mouseY={mouse.y} forceLook={sideForce} />
          </div>
          <div
            className="auth-fuse-char-smile"
            style={{
              left: passwordVisible ? 8 : 36 + gold.faceX,
              top: passwordVisible ? 84 : 86 + gold.faceY,
            }}
          />
        </div>
      </div>
    </div>
  )
}
