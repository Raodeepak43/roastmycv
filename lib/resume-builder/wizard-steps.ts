export type WizardStepId =
  | 'header'
  | 'experience'
  | 'education'
  | 'skills'
  | 'summary'
  | 'additional'
  | 'finalize'

export type PreviewSection =
  | 'header'
  | 'summary'
  | 'experience'
  | 'skills'
  | 'education'
  | 'additional'

export type WizardScreen =
  | { type: 'form'; stepId: WizardStepId }
  | { type: 'intro'; stepId: WizardStepId }

export const WIZARD_STEPS: { id: WizardStepId; label: string; preview: PreviewSection }[] = [
  { id: 'header', label: 'Header', preview: 'header' },
  { id: 'experience', label: 'Experience', preview: 'experience' },
  { id: 'education', label: 'Education', preview: 'education' },
  { id: 'skills', label: 'Skills', preview: 'skills' },
  { id: 'summary', label: 'Summary', preview: 'summary' },
  { id: 'additional', label: 'Additional', preview: 'additional' },
  { id: 'finalize', label: 'Finalize', preview: 'header' },
]

export const WIZARD_SCREENS: WizardScreen[] = [
  { type: 'form', stepId: 'header' },
  { type: 'intro', stepId: 'experience' },
  { type: 'form', stepId: 'experience' },
  { type: 'intro', stepId: 'education' },
  { type: 'form', stepId: 'education' },
  { type: 'intro', stepId: 'skills' },
  { type: 'form', stepId: 'skills' },
  { type: 'intro', stepId: 'summary' },
  { type: 'form', stepId: 'summary' },
  { type: 'intro', stepId: 'additional' },
  { type: 'form', stepId: 'additional' },
  { type: 'form', stepId: 'finalize' },
]

export function stepIndexForScreen(screenIndex: number): number {
  const screen = WIZARD_SCREENS[screenIndex]
  if (!screen) return 0
  return WIZARD_STEPS.findIndex((s) => s.id === screen.stepId)
}

export function previewSectionForScreen(screenIndex: number): PreviewSection {
  const screen = WIZARD_SCREENS[screenIndex]
  if (!screen) return 'header'
  const step = WIZARD_STEPS.find((s) => s.id === screen.stepId)
  return step?.preview ?? 'header'
}

export function introCopyFor(stepId: WizardStepId): {
  kicker: string
  title: string
  subtitle: string
} {
  const map: Record<WizardStepId, { kicker: string; title: string; subtitle: string }> = {
    header: { kicker: '', title: '', subtitle: '' },
    experience: {
      kicker: 'Great progress! Next up → Experience',
      title: 'Add details about your work experience',
      subtitle:
        'Our AI can help you strengthen bullets. Start with your most recent role first.',
    },
    education: {
      kicker: 'Great job! Next up → Education',
      title: "Now, let's add your education",
      subtitle: 'Include your degree, school, and graduation year.',
    },
    skills: {
      kicker: 'Great progress! Next up → Skills',
      title: 'Time to showcase your skills',
      subtitle: 'Pick skills that match the job. ATS systems scan for relevant keywords.',
    },
    summary: {
      kicker: 'Almost there! Next up → Summary',
      title: "Let's craft your professional summary",
      subtitle: 'Choose a prewritten example or write your own, then polish with AI.',
    },
    additional: {
      kicker: 'You got this! Last up → Additional Details',
      title: 'Select optional details to add',
      subtitle: "Pick anything you'd like to highlight that's not already on your resume.",
    },
    finalize: {
      kicker: 'You did it!',
      title: 'Your resume is ready',
      subtitle: 'Review your ATS score, pick a template, and download your PDF.',
    },
  }
  return map[stepId]
}

export function formTitleFor(stepId: WizardStepId): { title: string; subtitle: string } {
  const map: Record<WizardStepId, { title: string; subtitle: string }> = {
    header: {
      title: "Let's start with your header",
      subtitle: 'Include your full name and multiple ways for employers to reach you.',
    },
    experience: {
      title: "Let's work on your experience",
      subtitle: 'Start with your most recent job first.',
    },
    education: {
      title: 'Tell us about your education',
      subtitle: 'Add your degree, university, and graduation year.',
    },
    skills: {
      title: 'We recommend including 6–8 skills',
      subtitle: 'Choose skills that align with the job requirements.',
    },
    summary: {
      title: 'Craft your summary',
      subtitle: 'Start with a prewritten option or write your own. Use AI to polish it.',
    },
    additional: {
      title: 'Add details that show you are well-rounded',
      subtitle: 'Achievements, projects, and awards help you stand out.',
    },
    finalize: {
      title: 'Tips & fixes',
      subtitle: 'Expert suggestions, personalized for you.',
    },
  }
  return map[stepId]
}

import type { ResumeData } from '@/lib/resume-builder/types'

export function validateScreen(
  screenIndex: number,
  data: ResumeData,
): { ok: boolean; message?: string; skipPrompt?: boolean } {
  const screen = WIZARD_SCREENS[screenIndex]
  if (!screen || screen.type === 'intro') return { ok: true }

  if (screen.stepId === 'header') {
    if (!data.personal.fullName.trim()) {
      return { ok: false, message: 'Please enter your full name.' }
    }
    if (!data.personal.email.trim()) {
      return { ok: false, message: 'Please enter your email address.' }
    }
    return { ok: true }
  }

  if (screen.stepId === 'experience') {
    const hasExp = data.experience.some((e) => e.company.trim() || e.jobTitle.trim())
    if (!hasExp) {
      return {
        ok: false,
        skipPrompt: true,
        message: 'No experience added yet. Continue without experience?',
      }
    }
    return { ok: true }
  }

  return { ok: true }
}
