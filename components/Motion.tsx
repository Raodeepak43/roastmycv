'use client'

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
}

export const slideLines: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: EASE } },
}

type MotionBlockProps = HTMLMotionProps<'div'> & {
  children: ReactNode
  /** Animate when entering viewport (default). Set false for hero / immediate mount. */
  inView?: boolean
  delay?: number
}

export function MotionFadeUp({
  children,
  className,
  inView = true,
  delay = 0,
  ...rest
}: MotionBlockProps) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={inView ? undefined : 'visible'}
      whileInView={inView ? 'visible' : undefined}
      viewport={inView ? { once: true, margin: '-48px' } : undefined}
      variants={fadeUp}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function MotionScaleIn({
  children,
  className,
  delay = 0,
  ...rest
}: MotionBlockProps) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function MotionStagger({
  children,
  className,
  ...rest
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export { motion, AnimatePresence } from 'framer-motion'
