import type { ToolSlug } from '@/lib/tools/dashboard/config'
import type { CareerToolDemoVariant } from '@/lib/tools/marketing/config'

export type CareerToolDemoSample = {
  label: string
  content: string
}

export type CareerToolPreview = {
  variant: CareerToolDemoVariant
  badge?: string
  progress?: string
  interview?: {
    mode: 'text' | 'voice'
    question: string
    answer?: string
    transcript?: string
    words?: number
    fillers?: number
    elapsed?: string
    voiceOn?: boolean
    prevScore?: number
    prevNote?: string
    overallScore?: number
  }
  email?: {
    to: string
    subject: string
    body: string
  }
  analysis?: {
    score: number
    scoreLabel: string
    items: { kind: 'ok' | 'gap' | 'warn'; text: string }[]
    footer?: string
  }
  form?: {
    fields: { label: string; value: string }[]
    outputTitle: string
    output: string
  }
}

const PREVIEWS: Record<ToolSlug, CareerToolPreview> = {
  'voice-interview': {
    variant: 'interview',
    badge: 'Pro · Voice mode',
    progress: 'Question 4 of 10',
    interview: {
      mode: 'voice',
      question: 'You mentioned scaling payment APIs — walk me through the biggest production incident you handled.',
      transcript: 'So we had a spike during sale season, um, our queue backed up to like 40K messages…',
      words: 47,
      fillers: 3,
      elapsed: '0:42',
      voiceOn: true,
      prevScore: 8,
      prevNote: 'Good structure — reduce fillers on the opening sentence.',
    },
  },
  'mock-interview': {
    variant: 'interview',
    badge: 'Pro · Text + voice',
    progress: 'Question 6 of 10',
    interview: {
      mode: 'text',
      question: 'On your CV you led checkout optimisation — what metric moved and how did you measure it?',
      answer: 'We tracked cart abandonment on mobile. After one-page checkout, drop-off fell 18% in six weeks.',
      overallScore: 7,
    },
  },
  'interview-prep': {
    variant: 'form',
    badge: 'Pro',
    form: {
      fields: [
        { label: 'Target role', value: 'Product Manager @ Swiggy' },
        { label: 'Question types', value: 'Behavioural + CV-specific' },
      ],
      outputTitle: '15 personalised questions',
      output: '• Walk me through the retention experiment on your CV\n• How would you prioritise eng backlog with growth targets?',
    },
  },
  debrief: {
    variant: 'analysis',
    badge: 'Free',
    analysis: {
      score: 0,
      scoreLabel: '6/10 round',
      items: [
        { kind: 'ok', text: 'Strong: explained team structure clearly' },
        { kind: 'gap', text: 'Missed: quantified impact on metrics project' },
        { kind: 'warn', text: 'Fix: prepare cleaner "why leaving" answer' },
      ],
      footer: 'Thank-you email draft included',
    },
  },
  'jd-match': {
    variant: 'analysis',
    badge: 'Free · 2 total',
    analysis: {
      score: 78,
      scoreLabel: 'JD match',
      items: [
        { kind: 'ok', text: 'Matched: Python, REST APIs, PostgreSQL' },
        { kind: 'gap', text: 'Missing: Kubernetes, stakeholder mgmt' },
        { kind: 'warn', text: 'ATS risk: "team player" — rewrite with proof' },
      ],
      footer: '3 bullet rewrites suggested',
    },
  },
  'cover-letter': {
    variant: 'email',
    badge: 'Free · 1 total',
    email: {
      to: 'hiring@razorpay.com',
      subject: 'Application — Backend Engineer (Payments)',
      body: 'Dear Hiring Team,\n\nI am applying for the Backend Engineer role. At my last company I shipped UPI reconciliation APIs handling 2M+ daily transactions and cut p99 latency from 420ms to 180ms…',
    },
  },
  'cold-email': {
    variant: 'email',
    badge: 'Pro',
    email: {
      to: 'priya.sharma@phonepe.com',
      subject: 'Backend engineer — 3 yrs fintech APIs',
      body: 'Hi Priya — I saw the Backend opening. I built payment services at 40K TPS. Would you be open to a 10-minute intro call this week?',
    },
  },
  referral: {
    variant: 'email',
    badge: 'Pro',
    email: {
      to: 'LinkedIn DM — Priya (Razorpay)',
      subject: 'Referral ask — Backend Engineer',
      body: 'Hi Priya — hope you are well. I am applying for the Backend role at Razorpay; my payments background maps well. Would you be comfortable referring me?',
    },
  },
  linkedin: {
    variant: 'form',
    badge: 'Free · 2/day',
    form: {
      fields: [
        { label: 'Output', value: 'About section + open-to-work post' },
        { label: 'Tone', value: 'Professional, metrics-led' },
      ],
      outputTitle: 'LinkedIn About (excerpt)',
      output: 'Backend engineer · 3+ yrs building payment APIs at scale · Python, Go, AWS · Open to fintech roles in Bangalore.',
    },
  },
  'linkedin-audit': {
    variant: 'analysis',
    badge: 'Pro',
    analysis: {
      score: 62,
      scoreLabel: 'Profile score',
      items: [
        { kind: 'warn', text: 'Headline too generic — add niche + stack' },
        { kind: 'gap', text: 'About: no metrics from CV' },
        { kind: 'ok', text: 'Experience dates formatted correctly' },
      ],
      footer: '7 prioritized fixes',
    },
  },
  'cv-rewriter': {
    variant: 'form',
    badge: 'Free · 5/day',
    form: {
      fields: [{ label: 'Original bullet', value: 'Responsible for managing team and projects.' }],
      outputTitle: 'Rewritten bullet',
      output: 'Led 4-person squad shipping 12 releases/quarter; cut incident rate 35% via on-call runbooks.',
    },
  },
  'skills-gap': {
    variant: 'analysis',
    badge: 'Free · 3/day',
    analysis: {
      score: 65,
      scoreLabel: 'Role fit',
      items: [
        { kind: 'ok', text: 'Have: Python, SQL, dashboards' },
        { kind: 'gap', text: 'Need: A/B testing, SQL joins depth' },
        { kind: 'warn', text: 'Priority: SQL course before analytics apps' },
      ],
    },
  },
  'gap-explainer': {
    variant: 'form',
    badge: 'Free',
    form: {
      fields: [{ label: 'Gap', value: '8 months — upskilling + family' }],
      outputTitle: 'CV line + interview script',
      output: 'CV: Career break (2024) — completed AWS certification and freelance projects.\nInterview: 30-sec honest answer focusing on learning, not oversharing.',
    },
  },
  compress: {
    variant: 'form',
    badge: 'Pro',
    form: {
      fields: [{ label: 'Input', value: '2-page CV · 620 words' }],
      outputTitle: 'Compressed CV',
      output: '1 page · 480 words — kept top 3 roles, removed redundant skills list, tightened bullets.',
    },
  },
  'cv-localise': {
    variant: 'form',
    badge: 'Pro',
    form: {
      fields: [
        { label: 'Target', value: 'United Kingdom' },
        { label: 'Changes', value: 'Format + spelling + degree names' },
      ],
      outputTitle: 'Localised excerpt',
      output: 'Personal statement style opening · DD/MM dates · Removed photo line · "B.Tech" → "BEng equivalent"',
    },
  },
  'bias-check': {
    variant: 'analysis',
    badge: 'Free',
    analysis: {
      score: 0,
      scoreLabel: '3 issues',
      items: [
        { kind: 'warn', text: '"Young energetic team" → age bias' },
        { kind: 'warn', text: '"Manpower" → use "team capacity"' },
        { kind: 'ok', text: 'No caste or gender flags' },
      ],
      footer: 'Neutral rewrites suggested',
    },
  },
  salary: {
    variant: 'form',
    badge: 'Pro',
    form: {
      fields: [
        { label: 'Offer', value: '₹18 LPA fixed' },
        { label: 'Target', value: '₹24–26 LPA' },
      ],
      outputTitle: 'HR call script',
      output: '"Thank you for the offer. Based on my payment systems experience and Bangalore market for senior backend, I was hoping we could discuss ₹24 LPA…"',
    },
  },
  'offer-compare': {
    variant: 'analysis',
    badge: 'Pro',
    analysis: {
      score: 0,
      scoreLabel: '2 offers',
      items: [
        { kind: 'ok', text: 'Offer A: ₹22 LPA · MNC · stable' },
        { kind: 'gap', text: 'Offer B: ₹18 + ESOP · startup · higher risk' },
        { kind: 'warn', text: 'If 3-yr brand goal → lean Offer A' },
      ],
    },
  },
  'company-research': {
    variant: 'analysis',
    badge: 'Pro',
    analysis: {
      score: 0,
      scoreLabel: 'Brief ready',
      items: [
        { kind: 'ok', text: 'Series C · 2025 · payments infra' },
        { kind: 'ok', text: 'Main product: merchant checkout APIs' },
        { kind: 'gap', text: 'Ask: eng velocity vs reliability trade-offs' },
      ],
      footer: '5 questions for hiring manager',
    },
  },
  'career-path': {
    variant: 'analysis',
    badge: 'Pro',
    analysis: {
      score: 0,
      scoreLabel: '5-year map',
      items: [
        { kind: 'ok', text: 'Now → Senior Backend (12–18 mo)' },
        { kind: 'gap', text: 'Gap: system design depth' },
        { kind: 'ok', text: 'Target → Staff / Tech Lead (3–5 yr)' },
      ],
    },
  },
  'ninety-days': {
    variant: 'form',
    badge: 'Pro',
    form: {
      fields: [{ label: 'New role', value: 'Senior Backend @ fintech startup' }],
      outputTitle: '30 / 60 / 90 plan',
      output: '30d: stakeholder map + ship small bugfix\n60d: own on-call rotation\n90d: lead one feature metric',
    },
  },
  'thank-you': {
    variant: 'email',
    badge: 'Free',
    email: {
      to: 'sarah@company.com',
      subject: 'Thank you — Backend Engineer interview',
      body: 'Hi Sarah — thank you for today\'s conversation on the migration project. My API scaling work maps directly to your Q3 reliability goal. Happy to share additional samples.',
    },
  },
  'follow-up': {
    variant: 'email',
    badge: 'Free',
    email: {
      to: 'recruiter@company.com',
      subject: 'Following up — Product Manager role',
      body: 'Hi — checking in on the PM role we discussed 10 days ago. Still very interested; happy to provide work samples or references.',
    },
  },
  rejection: {
    variant: 'email',
    badge: 'Free',
    email: {
      to: 'hr@company.com',
      subject: 'Re: Application update',
      body: 'Thank you for the update. I appreciate your time. If possible, brief feedback would help. I remain open to future roles on the data team.',
    },
  },
  'rejection-analyser': {
    variant: 'analysis',
    badge: 'Pro',
    analysis: {
      score: 0,
      scoreLabel: '4 rejections',
      items: [
        { kind: 'warn', text: 'Pattern: "insufficient leadership" (4/5)' },
        { kind: 'gap', text: 'Fix: add people-management bullet' },
        { kind: 'ok', text: 'Technical depth not cited as issue' },
      ],
    },
  },
  resignation: {
    variant: 'email',
    badge: 'Free',
    email: {
      to: 'hr@company.com',
      subject: 'Resignation — Deepak Yadav — Backend Engineer',
      body: 'Dear HR,\n\nI am writing to formally resign, effective 30 days from today (15 Aug 2026). I will ensure smooth handover of the API migration project.\n\nThank you for the opportunity.',
    },
  },
  'elevator-pitch': {
    variant: 'form',
    badge: 'Free',
    form: {
      fields: [{ label: 'Scenario', value: 'Interview opener · 30 seconds' }],
      outputTitle: 'Your pitch',
      output: '"I am a backend engineer who scaled payment APIs to 2M daily transactions. Most recently I cut checkout drop-off 18% — I am excited about roles where reliability meets growth."',
    },
  },
  'scam-detector': {
    variant: 'analysis',
    badge: 'Free',
    analysis: {
      score: 82,
      scoreLabel: 'Scam risk',
      items: [
        { kind: 'warn', text: 'Upfront ₹5,000 training fee' },
        { kind: 'warn', text: 'Gmail-only HR · no company domain' },
        { kind: 'warn', text: '"Work from phone only" — WFH scam pattern' },
      ],
      footer: 'Do not share Aadhaar or pay fees',
    },
  },
  'freelancer-profile': {
    variant: 'form',
    badge: 'Free · 2/day',
    form: {
      fields: [
        { label: 'Platform', value: 'Upwork' },
        { label: 'Focus', value: 'Full-stack web apps' },
      ],
      outputTitle: 'Profile overview',
      output: 'Full-stack dev · 5 delivered client apps · React, Node, PostgreSQL · Fixed-price or hourly engagements.',
    },
  },
}

const SAMPLES: Record<ToolSlug, CareerToolDemoSample[]> = {
  'voice-interview': [
    { label: 'Live session', content: 'AI interviewer speaks each question · you answer by mic · live transcript + filler count.' },
    { label: 'Per-answer feedback', content: 'Content 8/10 — good STAR structure. Delivery: 3 filler words; pause instead of "um".' },
    { label: 'End report', content: 'Overall 7/10 · speech pattern: avg 142 words/answer · longest ramble on system design Q.' },
    { label: 'Voice playback', content: 'Tap "Hear question" — the AI interviewer reads each prompt before you record.' },
  ],
  'mock-interview': [
    { label: 'Session', content: '10 CV-based questions · type or speak answers · scored debrief at end.' },
    { label: 'Overall score', content: '7/10 — strong leadership examples; tighten metrics on impact stories.' },
    { label: 'Per-question', content: 'Q: "Conflict at work" — Weak: vague outcome. Stronger: use STAR with measurable result.' },
    { label: 'Sample framework', content: 'Situation → Task → Action → Result template provided for weak answers.' },
  ],
  'interview-prep': [
    { label: 'Output', content: '15 questions for PM @ Swiggy — behavioural, technical, and CV-specific.' },
    { label: 'Why it matters', content: 'Each question includes why recruiters ask it and what to prep from your CV.' },
  ],
  debrief: [
    { label: 'Strengths', content: 'Explained team structure well; showed domain knowledge on payments.' },
    { label: 'Gaps', content: 'Undersold metrics project — rewrite that CV bullet before next round.' },
    { label: 'Action items', content: 'Prep "why leaving" · send thank-you email (draft included).' },
  ],
  'jd-match': [
    { label: 'Match score', content: '78% — strong on Python, REST APIs, PostgreSQL.' },
    { label: 'Missing ATS keywords', content: 'Kubernetes · stakeholder management · OKR planning' },
    { label: 'Bullet rewrite', content: '"Built APIs" → "Shipped payment REST APIs (2M daily txns) with 99.95% uptime."' },
  ],
  'cover-letter': [
    { label: 'Opening', content: 'Dear Hiring Team — applying for Backend Engineer at Razorpay; 3 yrs payment API experience…' },
    { label: 'Proof point', content: 'Maps your latency improvement (420ms → 180ms) to their cloud migration JD line.' },
    { label: 'Close', content: 'Professional sign-off with availability for a call this week.' },
  ],
  'cold-email': [
    { label: 'Subject', content: 'Backend engineer — 3 yrs fintech APIs — quick intro' },
    { label: 'Body', content: '3–5 sentences · ties your 40K TPS work to their opening · clear ask for 10-min call.' },
  ],
  referral: [
    { label: 'LinkedIn DM', content: 'Warm tone · names the role · references mutual context · polite referral ask.' },
    { label: 'Email variant', content: 'Shorter version if you have their work email.' },
  ],
  linkedin: [
    { label: 'About section', content: 'Opening with role + stack + top metric from CV; no cringe buzzwords.' },
    { label: 'Open-to-work post', content: 'Short post highlighting what roles you want and one proof point.' },
  ],
  'linkedin-audit': [
    { label: 'Headline fix', content: '"Software Engineer" → "Backend Engineer · Payments · Python/Go"' },
    { label: 'About fix', content: 'Add 2 quantified bullets copied from your strongest CV lines.' },
    { label: 'Score', content: '62/100 — 7 fixes ranked by recruiter search impact.' },
  ],
  'cv-rewriter': [
    { label: 'Before', content: 'Responsible for managing the team and doing projects.' },
    { label: 'After (option A)', content: 'Led 4-person squad shipping 12 releases/quarter; cut incidents 35%.' },
    { label: 'After (option B)', content: 'Managed delivery for checkout revamp — 18% lower cart abandonment in Q2.' },
  ],
  'skills-gap': [
    { label: 'You have', content: 'Python · SQL · dashboards · Agile' },
    { label: 'Role needs', content: 'A/B testing · advanced SQL · stakeholder presentations' },
    { label: 'Priority', content: 'Complete SQL joins course before applying to analytics roles.' },
  ],
  'gap-explainer': [
    { label: 'CV line', content: 'Career break (2024) — AWS certification + freelance projects.' },
    { label: 'Interview (30 sec)', content: 'Focused on structured upskilling; ready to contribute from day one.' },
  ],
  compress: [
    { label: 'Before', content: '2 pages · 620 words · redundant skills block' },
    { label: 'After', content: '1 page · 480 words · top 3 roles + metrics preserved' },
  ],
  'cv-localise': [
    { label: 'UK changes', content: 'Personal statement · DD/MM dates · degree naming · no photo' },
    { label: 'US changes', content: 'Resume summary · MM/YYYY · action-verb bullets only' },
  ],
  'bias-check': [
    { label: 'Flagged', content: '"Young energetic team" → suggest "collaborative cross-functional team"' },
    { label: 'Clean', content: 'No gender, age, caste, or exclusionary phrases in experience section.' },
  ],
  salary: [
    { label: 'Opening anchor', content: '₹24 LPA based on payment systems lead experience + Bangalore senior market.' },
    { label: 'If they say budget', content: '"I understand constraints — could we explore ₹22 LPA with a 6-month performance review?"' },
  ],
  'offer-compare': [
    { label: 'Offer A', content: '₹22 LPA · MNC · stable brand · slower growth' },
    { label: 'Offer B', content: '₹18 + ESOP · startup · higher learning · more risk' },
    { label: 'Framework', content: 'Decision tree based on your stated 3-year career goal.' },
  ],
  'company-research': [
    { label: 'Snapshot', content: 'Series C fintech · merchant checkout APIs · hiring eng for reliability.' },
    { label: 'Questions to ask', content: 'How does eng balance feature velocity vs incident budget?' },
  ],
  'career-path': [
    { label: 'Year 1–2', content: 'Senior Backend — deepen system design + mentoring.' },
    { label: 'Year 3–5', content: 'Staff / Tech Lead path with architecture ownership milestones.' },
  ],
  'ninety-days': [
    { label: 'Days 1–30', content: 'Meet stakeholders · learn codebase · ship small win.' },
    { label: 'Days 31–60', content: 'Own on-call · propose one process improvement.' },
    { label: 'Days 61–90', content: 'Lead feature with measurable metric.' },
  ],
  'thank-you': [
    { label: 'Subject', content: 'Thank you — Backend Engineer interview' },
    { label: 'Body', content: 'References specific topic discussed · ties your work to their Q3 goal · sent within 24h.' },
  ],
  'follow-up': [
    { label: 'Timing', content: 'Polite nudge 7–10 days after interview · no desperation tone.' },
    { label: 'Body', content: 'Still interested · offer additional samples · one short paragraph.' },
  ],
  rejection: [
    { label: 'Tone', content: 'Gracious · thanks them · asks optional feedback · keeps door open.' },
    { label: 'Length', content: '3–4 sentences — professional, not emotional.' },
  ],
  'rejection-analyser': [
    { label: 'Pattern', content: '4/5 rejections cite "insufficient leadership experience".' },
    { label: 'Fix', content: 'Add squad-lead bullet · target Team Lead titles in applications.' },
  ],
  resignation: [
    { label: 'Format', content: 'India corporate standard · notice period · last working day · handover offer.' },
    { label: 'Tone', content: 'Professional · grateful · no burning bridges.' },
  ],
  'elevator-pitch': [
    { label: '30-second', content: 'Backend engineer · scaled payments to 2M txns/day · seeking fintech growth roles.' },
    { label: '60-second STAR', content: 'Full "tell me about yourself" with one project story and result.' },
  ],
  'scam-detector': [
    { label: 'Risk', content: '82/100 — high scam probability' },
    { label: 'Red flags', content: 'Training fee · Gmail HR · no MCA listing · work-from-phone only' },
    { label: 'Verdict', content: 'Do not pay or share Aadhaar. Verify company on MCA portal.' },
  ],
  'freelancer-profile': [
    { label: 'Upwork overview', content: '5 delivered web apps · React/Node stack · client testimonials angle.' },
    { label: 'Service titles', content: '3 gig titles with clear deliverables and timelines.' },
  ],
}

export function getCareerToolPreview(slug: ToolSlug): CareerToolPreview {
  return PREVIEWS[slug]
}

export function getCareerToolDemoSamples(slug: ToolSlug, fallback: string): CareerToolDemoSample[] {
  const custom = SAMPLES[slug]
  if (custom?.length) return custom

  const parts = fallback.split(/\s*—\s*/).filter(Boolean)
  if (parts.length >= 2) {
    return parts.map((content, i) => ({
      label: i === 0 ? 'Summary' : `Detail ${i}`,
      content: content.trim(),
    }))
  }

  return [{ label: 'Sample output', content: fallback }]
}
