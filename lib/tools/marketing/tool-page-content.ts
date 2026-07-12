import type { ToolSlug } from '@/lib/tools/dashboard/config'
import type { CareerToolMarketing } from '@/lib/tools/marketing/config'
import { TOOL_CATEGORIES } from '@/lib/tools/dashboard/config'

export type ToolPageContent = {
  eyebrow: string
  demoTitle: string
  demoSubtitle: string
  /** Exact capabilities — shown as pills on the page */
  provides: string[]
  outcome: string
}

const CONTENT: Partial<Record<ToolSlug, ToolPageContent>> = {
  'interview-prep': {
    eyebrow: 'Interview · Question coach',
    demoTitle: 'Questions from your CV — not Google lists',
    demoSubtitle: 'Behavioural, technical, CV-specific, and situational — each with why it matters and how to prep.',
    provides: ['Behavioural STAR questions', 'Technical role questions', 'CV-specific follow-ups', 'Situational scenarios', 'Prep note per question'],
    outcome: 'A structured question list you can rehearse before the real call.',
  },
  'mock-interview': {
    eyebrow: 'Interview · AI mock',
    demoTitle: 'Full mock interview with scored debrief',
    demoSubtitle: 'CV-based questions, optional AI voice, per-answer feedback, and sample STAR frameworks.',
    provides: ['10 CV-based questions', 'Natural interviewer voice', 'Text or spoken answers', 'Score per question', 'End-of-session report'],
    outcome: 'Realistic practice before HR, technical, or manager rounds.',
  },
  'voice-interview': {
    eyebrow: 'Interview · Voice mode',
    demoTitle: 'Speak answers — fix delivery + content',
    demoSubtitle: 'Live transcription, filler-word tracking, and separate scores for what you said vs how you said it.',
    provides: ['5 interviewer voices', 'Question voice playback', 'Live speech transcript', 'Filler & pace tracking', 'Speech pattern report'],
    outcome: 'Fix "um", rambling, and nervous delivery before phone screens.',
  },
  debrief: {
    eyebrow: 'Interview · Post-round',
    demoTitle: 'Turn a rough round into a prep plan',
    demoSubtitle: 'Paste what happened — get honest gaps, strengths, and concrete fixes for next time.',
    provides: ['Strengths vs misses', 'CV alignment check', 'Answer rewrite tips', 'Thank-you email draft', 'Next-round checklist'],
    outcome: 'Structured reflection instead of overthinking alone.',
  },
  linkedin: {
    eyebrow: 'LinkedIn · Profile copy',
    demoTitle: 'About section & posts from your CV',
    demoSubtitle: 'Metrics-led copy that sounds credible — not generic LinkedIn fluff.',
    provides: ['About section rewrite', 'Open-to-work post', 'Proof points from CV', 'Professional tone', 'Copy-paste ready'],
    outcome: 'Stronger recruiter discovery while you apply.',
  },
  'linkedin-audit': {
    eyebrow: 'LinkedIn · Profile audit',
    demoTitle: 'Roast your profile like your CV',
    demoSubtitle: 'Headline, About, and experience scored for recruiter search with a prioritized fix list.',
    provides: ['Profile score', 'Headline fixes', 'About gaps', 'Experience alignment', 'Priority action list'],
    outcome: 'Know exactly what to fix on LinkedIn this week.',
  },
  'jd-match': {
    eyebrow: 'Apply · JD matcher',
    demoTitle: 'CV vs job description — before you apply',
    demoSubtitle: 'Match score, missing ATS keywords, and bullet rewrites aligned to the role.',
    provides: ['Fit percentage', 'Keyword gaps', 'ATS risk flags', 'Bullet rewrites', 'Apply / skip signal'],
    outcome: 'Tailor each application instead of spray-and-pray.',
  },
  'cover-letter': {
    eyebrow: 'Apply · Cover letter',
    demoTitle: 'Letter tied to your CV — not a template',
    demoSubtitle: 'Three paragraphs linking your proof points to the hiring team\'s JD.',
    provides: ['JD-aware opening', 'CV proof bullets', 'Role-specific close', 'Professional tone', 'Editable output'],
    outcome: 'A cover letter recruiters actually read.',
  },
  'cold-email': {
    eyebrow: 'Apply · Outreach',
    demoTitle: 'Short recruiter emails that get replies',
    demoSubtitle: '3–5 sentences with a clear ask — built from your CV highlights.',
    provides: ['Subject line', 'Concise body', 'CV proof hook', 'Clear CTA', 'Recruiter-friendly tone'],
    outcome: 'Targeted outreach beyond job portals.',
  },
  referral: {
    eyebrow: 'Apply · Referral ask',
    demoTitle: 'Ask for a referral without awkwardness',
    demoSubtitle: 'Warm LinkedIn or email message referencing mutual context and your fit.',
    provides: ['LinkedIn DM draft', 'Email variant', 'Mutual context line', 'Polite ask', 'Short & specific'],
    outcome: 'Higher response rate on referral requests.',
  },
  'cv-rewriter': {
    eyebrow: 'CV · Bullet rewriter',
    demoTitle: 'Weak bullet → quantified ATS line',
    demoSubtitle: 'Action verbs, metrics, and clarity — keeping your facts honest.',
    provides: ['Multiple rewrites', 'Metric suggestions', 'ATS-friendly verbs', 'Before / after', 'Copy to builder'],
    outcome: 'Upgrade experience lines after a roast or JD match.',
  },
  'skills-gap': {
    eyebrow: 'CV · Skills gap',
    demoTitle: 'What to learn before you apply',
    demoSubtitle: 'Your skills vs target role — ranked gaps and learning priorities.',
    provides: ['Skills you have', 'Role requirements', 'Missing keywords', 'Learning priority', 'Course suggestions'],
    outcome: 'Apply smarter or upskill first — with a clear plan.',
  },
  'gap-explainer': {
    eyebrow: 'CV · Career gap',
    demoTitle: 'Explain gaps on CV & in interviews',
    demoSubtitle: 'One CV line plus a 30-second interview script — honest, not defensive.',
    provides: ['CV gap line', '30-sec interview script', 'Positive framing', 'No oversharing', 'India workplace tone'],
    outcome: 'Address employment gaps confidently.',
  },
  compress: {
    eyebrow: 'CV · 1-page compressor',
    demoTitle: 'Fit more impact on one page',
    demoSubtitle: 'Trim redundancy while keeping your strongest proof points.',
    provides: ['Word count reduction', 'Bullet tightening', 'Role prioritization', 'Skills trim', 'One-page output'],
    outcome: 'Senior CVs that still fit one page.',
  },
  'cv-localise': {
    eyebrow: 'CV · International',
    demoTitle: 'Adapt CV for US, UK, EU, or UAE',
    demoSubtitle: 'Format, spelling, and cultural cues for target country hiring norms.',
    provides: ['Region picker', 'Date format fix', 'Degree naming', 'Summary style', 'Photo / personal line rules'],
    outcome: 'Applications that look native abroad.',
  },
  'bias-check': {
    eyebrow: 'CV · Fair wording',
    demoTitle: 'Catch risky phrasing before recruiters do',
    demoSubtitle: 'Age, gender, and exclusionary language flagged with neutral alternatives.',
    provides: ['Bias flags', 'Neutral rewrites', 'Section scan', 'Inclusive alternatives', 'Quick fixes'],
    outcome: 'CV language that passes inclusive hiring screens.',
  },
  salary: {
    eyebrow: 'Offers · Negotiation',
    demoTitle: 'Scripts for CTC conversations in India',
    demoSubtitle: 'Opening anchor, counter lines, and responses when HR cites "budget".',
    provides: ['Opening anchor script', 'Counter if lowballed', 'Proof points from CV', 'HR call flow', 'India CTC context'],
    outcome: 'Say the right thing on the offer call.',
  },
  'offer-compare': {
    eyebrow: 'Offers · Comparator',
    demoTitle: 'Two offers — one clear decision',
    demoSubtitle: 'Cash, equity, growth, and risk weighed in plain language.',
    provides: ['Side-by-side matrix', 'Trade-off summary', '3-year lens', 'Risk factors', 'Decision framework'],
    outcome: 'Choose startup vs MNC with eyes open.',
  },
  'company-research': {
    eyebrow: 'Interview · Company brief',
    demoTitle: 'Walk in knowing the business',
    demoSubtitle: 'News, product lines, culture signals, and questions to ask interviewers.',
    provides: ['Company snapshot', 'Recent news', 'Product overview', '5 questions to ask', 'Role-specific angles'],
    outcome: 'Final-round prep in minutes, not hours.',
  },
  'career-path': {
    eyebrow: 'Career · Path planner',
    demoTitle: 'Where your CV can go next',
    demoSubtitle: 'Realistic next roles, skills to build, and a 3–5 year map.',
    provides: ['Next role options', 'Skill milestones', 'IC vs manager paths', 'Timeline', 'Action steps'],
    outcome: 'A plan beyond "apply everywhere".',
  },
  'ninety-days': {
    eyebrow: 'Career · First 90 days',
    demoTitle: '30 / 60 / 90 plan for a new role',
    demoSubtitle: 'Learning, delivery, and stakeholder milestones tailored to your title.',
    provides: ['Days 1–30 goals', 'Days 31–60 goals', 'Days 61–90 goals', 'Stakeholder map', 'Shareable with manager'],
    outcome: 'Hit the ground running after offer acceptance.',
  },
  'thank-you': {
    eyebrow: 'Email · Post-interview',
    demoTitle: 'Thank-you while you\'re still fresh',
    demoSubtitle: 'References specific moments from the round and your fit.',
    provides: ['Personalized opening', 'Round-specific reference', 'Fit reminder', 'Professional close', 'Send within 24h'],
    outcome: 'Stay top of mind after the interview.',
  },
  'follow-up': {
    eyebrow: 'Email · Follow-up',
    demoTitle: 'Polite nudge when HR ghosts',
    demoSubtitle: 'Not pushy — references timeline and enthusiasm.',
    provides: ['Timing-aware tone', 'Role reference', 'Interest reaffirm', 'Offer to share samples', 'One short paragraph'],
    outcome: 'Follow up without sounding desperate.',
  },
  rejection: {
    eyebrow: 'Email · Rejection reply',
    demoTitle: 'Stay professional — keep the door open',
    demoSubtitle: 'Gracious reply that preserves network for future roles.',
    provides: ['Gracious tone', 'Optional feedback ask', 'Future openness', 'Short format', 'Network-safe'],
    outcome: 'Reply without burning bridges.',
  },
  'rejection-analyser': {
    eyebrow: 'Apply · Pattern analysis',
    demoTitle: 'Why you keep getting no\'s',
    demoSubtitle: 'Recurring gaps across rejections and JDs — with a fix roadmap.',
    provides: ['Pattern detection', 'CV gap themes', 'Title targeting tips', 'Bullet fixes', 'Systemic roadmap'],
    outcome: 'Fix the real issue on long job searches.',
  },
  resignation: {
    eyebrow: 'Email · Resignation',
    demoTitle: 'Clean exit letter for India workplaces',
    demoSubtitle: 'Notice period, last working day, gratitude, and handover offer.',
    provides: ['India format', 'Notice period line', 'Last working day', 'Handover offer', 'Professional tone'],
    outcome: 'Resign without drama — HR-ready letter.',
  },
  'elevator-pitch': {
    eyebrow: 'Interview · Pitch',
    demoTitle: '30s & 60s "Tell me about yourself"',
    demoSubtitle: 'Networking and interview openers built from your CV.',
    provides: ['30-second script', '60-second STAR version', 'Scenario picker', 'Metrics included', 'Optional read-aloud'],
    outcome: 'Never freeze on the opener again.',
  },
  'scam-detector': {
    eyebrow: 'Safety · Job scams',
    demoTitle: 'Spot fake offers before sharing Aadhaar',
    demoSubtitle: 'Red flags common in India — upfront fees, Gmail HR, WFH phone scams.',
    provides: ['Risk score', 'Red flag list', 'India scam patterns', 'Safety checklist', 'Verdict & next steps'],
    outcome: 'Protect yourself from fake recruiters.',
  },
  'freelancer-profile': {
    eyebrow: 'Freelance · Platform bio',
    demoTitle: 'Upwork / Fiverr bio from your CV',
    demoSubtitle: 'Overview plus service titles with clear deliverables.',
    provides: ['Platform overview', 'Service titles', 'Deliverable blurbs', 'Stack highlights', 'Client-ready copy'],
    outcome: 'Launch on gig platforms with a credible profile.',
  },
}

function categoryEyebrow(categoryId: string): string {
  const cat = TOOL_CATEGORIES.find((c) => c.id === categoryId)
  return cat ? `${cat.emoji} ${cat.title}` : 'Career AI tool'
}

export function getToolPageContent(tool: CareerToolMarketing): ToolPageContent {
  const custom = CONTENT[tool.slug]
  if (custom) return custom

  return {
    eyebrow: categoryEyebrow(tool.categoryId),
    demoTitle: `Try ${tool.headline} live`,
    demoSubtitle: tool.whatItDoes,
    provides: tool.howItWorks.slice(0, 5).map((s) => s.replace(/\.$/, '')),
    outcome: tool.outputLabel,
  }
}
