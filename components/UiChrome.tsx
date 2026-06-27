'use client'

import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export function SectionHeading({ title }: { title: string }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <div className="section-heading">
        <span className="section-heading__line" aria-hidden />
        <h2 className="section-heading__title">{title}</h2>
        <span className="section-heading__line" aria-hidden />
      </div>
    )
  }

  return (
    <div className="section-heading">
      <motion.span
        className="section-heading__line origin-left"
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
      />
      <motion.h2
        className="section-heading__title"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
      >
        {title}
      </motion.h2>
      <motion.span
        className="section-heading__line origin-right"
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
      />
    </div>
  )
}

export function HighVoltageBadge({ text, className = '' }: { text: string; className?: string }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <p className={`high-voltage-badge ${className}`.trim()} role="note">
        <span className="high-voltage-badge__icon" aria-hidden>
          ⚡
        </span>
        {text}
      </p>
    )
  }

  return (
    <motion.p
      className={`high-voltage-badge ${className}`.trim()}
      role="note"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.span
        className="high-voltage-badge__icon"
        aria-hidden
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ⚡
      </motion.span>
      {text}
    </motion.p>
  )
}
