/**
 * SERP title helpers — never slice mid-phrase.
 * Hyphens inside compound words (step-by-step, off-campus) must be preserved.
 */

const INCOMPLETE_SINGLE_WORD_ENDINGS =
  /\b(The|A|An|For|To|And|Or|In|On|From|Your|Off|Service|Build a Job|A Step|\(Step)\s*$/i

/** Split only on subtitle separators — NOT hyphens inside words. */
export function stripTitleSubtitle(title: string): string {
  let t = title.trim()
  t = t.replace(/\s*\(\d{4}\)\s*$/, '').trim()
  // Em dash or en dash subtitle: "Topic — Detail"
  if (/\s[—–]\s/.test(t)) {
    t = t.split(/\s[—–]\s/)[0]!.trim()
  }
  // ASCII dash subtitle only when spaced: "Topic - Detail" (not step-by-step)
  else if (/\s-\s/.test(t)) {
    t = t.split(/\s-\s/)[0]!.trim()
  }
  return t
}

/** Detect titles cut mid-phrase — not valid compound endings like step-by-step. */
export function hasIncompleteSerpEnding(title: string): boolean {
  const t = title.trim()
  if (!t) return true

  if (/-(?:by-step|up|ready|campus|based|page|powered|friendly|sized|listing)\s*$/i.test(t)) {
    return false
  }
  if (
    /\b(?:Step-by-Step|Follow-Up|Job-Ready|Off-Campus|One-Page|Service-Based|Any Job|With AI|With Examples|Online Tool)\s*$/i.test(
      t,
    )
  ) {
    return false
  }

  if (/\bStep\s*$/i.test(t) && !/step-by-step\s*$/i.test(t)) return true
  if (/\bFollow\s*$/i.test(t) && !/follow-up\s*$/i.test(t)) return true
  if (
    /\bJob\s*$/i.test(t) &&
    !/\b(?:Any|Every|New|Remote|Dream|Target|First|Side|Day|Full|Part)\s+Job\s*$/i.test(t)
  ) {
    return true
  }
  if (/\bWith\s*$/i.test(t)) return true

  return INCOMPLETE_SINGLE_WORD_ENDINGS.test(t)
}

export function isBrokenSerpTitle(metaTitle: string, title: string): boolean {
  const mt = metaTitle.trim()
  const t = title.trim()
  if (!mt) return true
  if (mt.length < 12) return true
  if (/…/.test(mt)) return true
  if (hasIncompleteSerpEnding(mt)) return true
  if (mt.includes('(Step') && !/step-by-step/i.test(mt)) return true
  if (/Free Tool Guide$/i.test(mt)) return true
  // Shorter than 35% of title and title is substantive
  if (t.length > 40 && mt.length < t.length * 0.35) return true
  return false
}

/** Prefer complete title; optional light cleanup only. */
export function repairSerpTitleFromTitle(title: string): string {
  return title.replace(/\s*\(\d{4}\)\s*$/, '').trim() || title.trim()
}

export function blogSerpTitleBase(metaTitle: string | undefined, title: string): string {
  const candidate = (metaTitle?.trim() || title.trim())
  if (isBrokenSerpTitle(candidate, title)) {
    return repairSerpTitleFromTitle(title)
  }
  return candidate
}
