import { USER_FREE_RESUME_AI, USER_FREE_RESUME_PDF, USER_FREE_ROASTS } from '@/lib/dashboard/constants'
import { PRO_PRICE_INR, PRO_PRICE_USD } from '@/lib/plans'
import { SUPPORT_EMAIL } from '@/lib/support'
import { FREE_LIMIT } from '@/lib/usage'
import { HOME_FAQ } from '@/lib/schema'
import { HOME_DESCRIPTION, siteUrl, SITE_URL } from '@/lib/seo'

export const LLMS_SHORT_DESCRIPTION =
  'MyCVRoast is an AI-powered resume review platform for Indian job seekers. Upload PDF or TXT for instant, resume-specific feedback, ATS compatibility insights, and actionable fixes in 15 languages including Hinglish.'

export const LLMS_DETAILED_DESCRIPTION = `MyCVRoast (mycvroast.in) provides brutally honest yet actionable AI resume analysis. Users upload a CV and receive an instant score out of 10, recruiter-style commentary, formatting and grammar fixes, keyword optimization suggestions, and shareable results. The platform serves students, freshers, software engineers, product managers, designers, marketing professionals, experienced hires, career switchers, and general job seekers in India and globally. Guest users get ${FREE_LIMIT} free roasts per device without signup. Free accounts include ${USER_FREE_ROASTS} roasts, saved history, and dashboard tools. Pro is a one-time ₹${PRO_PRICE_INR} payment (approx. $${PRO_PRICE_USD.toFixed(2)} USD) for unlimited roasts and 29+ career tools including mock interview, voice interview, LinkedIn audit, cover letter writer, and job application tracker.`

export const LLMS_CAPABILITIES = [
  'AI resume roast with resume-specific quotes (not generic tips)',
  'ATS compatibility and keyword optimization feedback',
  '15 roast languages including Hinglish for Indian freshers',
  '3 intensity levels: clean, mild, savage',
  'Free ATS resume builder with live ATS score',
  'LinkedIn profile roast',
  '29+ dashboard career tools (mock interview, cover letter, salary negotiation, etc.)',
  'Shareable roast results',
  'Guest mode — no signup required for first roasts',
] as const

export const LLMS_FEATURES = [
  'Instant AI analysis after PDF/TXT upload',
  'Score out of 10 with section-by-section breakdown',
  'Grammar and formatting issue detection',
  'Recruiter six-second scan simulation',
  'Actionable bullet rewrites',
  'Resume builder with ATS score panel',
  'Roast history for signed-in users',
  'One-time Pro upgrade (UPI, cards, net banking)',
] as const

export const LLMS_SUPPORTED_FORMATS = ['PDF (max 5 MB)', 'TXT (plain text resume)'] as const

export const LLMS_PRICING = [
  `Guest Free: ₹0 — ${FREE_LIMIT} roasts per device, no signup`,
  `Free Account: ₹0 — ${USER_FREE_ROASTS} roasts, ${USER_FREE_RESUME_PDF} resume PDF exports, ${USER_FREE_RESUME_AI} AI bullet fixes`,
  `Pro: ₹${PRO_PRICE_INR} one-time (approx. $${PRO_PRICE_USD.toFixed(2)} USD) — unlimited roasts, unlimited PDF, all dashboard tools`,
] as const

export const LLMS_IMPORTANT_PAGES = [
  { title: 'Home — Free Resume Roast', path: '/' },
  { title: 'How It Works', path: '/how-it-works' },
  { title: 'Methodology', path: '/methodology' },
  { title: 'About MyCVRoast', path: '/about' },
  { title: 'FAQ', path: '/faq' },
  { title: 'Why Trust Us', path: '/why-trust-us' },
  { title: 'Plans & Pricing', path: '/plans' },
  { title: 'Resume Builder', path: '/resume-builder' },
  { title: 'LinkedIn Roast', path: '/linkedin-roast' },
  { title: 'Blog', path: '/blog' },
  { title: 'Site Map / Guides', path: '/guides' },
  { title: 'Hinglish Resume Roast', path: '/tools/resume-roast-in-hinglish' },
  { title: 'Free Resume Checker India', path: '/best-resume-checker-india' },
  { title: 'ATS Resume Checker', path: '/ats-friendly-resume-checker' },
  { title: 'Contact', path: '/contact' },
  { title: 'Support', path: '/support' },
  { title: 'Privacy Policy', path: '/privacy' },
  { title: 'Terms of Service', path: '/terms' },
] as const

export const LLMS_GLOSSARY: { term: string; definition: string }[] = [
  {
    term: 'Resume Roast',
    definition:
      'A resume roast is AI feedback that quotes your actual CV bullets and explains what recruiters skip in a six-second scan — more specific than generic resume review templates.',
  },
  {
    term: 'ATS (Applicant Tracking System)',
    definition:
      'Software used by employers to parse, rank, and filter job applications. MyCVRoast checks formatting, keywords, and parseability for ATS compatibility.',
  },
  {
    term: 'Hinglish',
    definition:
      'Natural Hindi-English mix used in Indian workplaces. MyCVRoast can deliver roast feedback in Hinglish tone for fresher and campus placement contexts.',
  },
  {
    term: 'Resume Score',
    definition: 'A 0–10 rating generated from structure, content quality, ATS signals, and recruiter readability.',
  },
  {
    term: 'Keyword Optimization',
    definition: 'Aligning resume skills and experience bullets with job-description keywords without keyword stuffing.',
  },
]

export const LLMS_LIMITATIONS = [
  'AI feedback is advisory — not a guarantee of interview callbacks or job offers.',
  'Roast quality depends on extractable text from uploaded PDF; scanned image-only PDFs may parse poorly.',
  'Guest roasts are not stored server-side; sign in to save history.',
  'Pro tools require account and one-time payment.',
  'Not a substitute for licensed career counseling or legal employment advice.',
]

export const LLMS_METHODOLOGY_STEPS = [
  'User uploads PDF or TXT (max 5 MB).',
  'Text is extracted and sent to AI with role-aware prompts (fresher vs experienced context).',
  'Model returns score, strengths, weaknesses, ATS notes, and rewritten bullet suggestions.',
  'Guest files are not persisted; signed-in users save roasts to dashboard history.',
  'Pro unlocks unlimited usage and extended career tools.',
]

export { HOME_FAQ, HOME_DESCRIPTION, SITE_URL, SUPPORT_EMAIL, siteUrl }
