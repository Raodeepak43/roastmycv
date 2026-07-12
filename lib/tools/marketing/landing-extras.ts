import type { ToolSlug } from '@/lib/tools/dashboard/config'
import type { CareerToolDemoSample } from '@/lib/tools/marketing/demo-previews'

export type CareerToolFaq = { question: string; answer: string }
export type { CareerToolDemoSample }

const FAQ_BY_SLUG: Partial<Record<ToolSlug, CareerToolFaq[]>> = {
  'mock-interview': [
    {
      question: 'How is this different from ChatGPT interview practice?',
      answer:
        'MyCVRoast reads your actual CV and asks questions tied to your experience — not generic lists. You get scored feedback and sample STAR frameworks after each session.',
    },
    {
      question: 'Does the AI interviewer speak out loud?',
      answer:
        'Yes. Questions can play in a natural voice. You can answer by typing or speaking; voice mode tracks fillers and pace.',
    },
    {
      question: 'Is mock interview free?',
      answer: 'Mock interview is a Pro tool. Free users can roast their CV on the homepage and try other free-tier dashboard tools.',
    },
  ],
  'voice-interview': [
    {
      question: 'How does voice mock interview work?',
      answer:
        'The AI interviewer speaks each question in a natural voice. You record your answer — live transcript tracks words, fillers, and pace. You get per-answer scores plus a speech pattern report at the end.',
    },
    {
      question: 'What feedback do I get on delivery?',
      answer:
        'Filler word count, answer length, and delivery notes (e.g. "pause instead of um"). Content and delivery are scored separately.',
    },
    {
      question: 'Is voice interview free?',
      answer: 'Voice mock interview is Pro only — same as text mock interview. Sign in and upgrade to practice speaking before your real call.',
    },
  ],
  'cover-letter': [
    {
      question: 'Will the cover letter match my CV?',
      answer:
        'Yes. The tool uses your saved CV plus the job description to write a tailored letter — not a generic template.',
    },
    {
      question: 'How many free cover letters do I get?',
      answer: 'Free users get 1 cover letter total. Pro unlocks unlimited generations across all career tools.',
    },
    {
      question: 'Can I use this for Indian companies?',
      answer:
        'Absolutely. Paste any JD from Naukri, LinkedIn, or company careers pages — output works for India and global roles.',
    },
  ],
  'jd-match': [
    {
      question: 'What does JD match score mean?',
      answer:
        'It compares your CV against the job description and highlights matched skills, missing keywords, and gaps recruiters might filter on.',
    },
    {
      question: 'How many free JD matches do I get?',
      answer: 'Free tier includes 2 JD matches total. Upgrade to Pro for unlimited matching while you apply.',
    },
  ],
  resignation: [
    {
      question: 'Is the resignation letter format valid in India?',
      answer:
        'Yes. Output follows a professional Indian workplace format with notice period, last working day, and handover tone.',
    },
    {
      question: 'Is resignation letter generator free?',
      answer: 'Yes — unlimited free resignation letters on MyCVRoast. No Pro plan required.',
    },
  ],
  'skills-gap': [
    {
      question: 'What skills gap analysis shows?',
      answer:
        'Skills you already have, skills the JD expects but your CV does not mention, and suggested bullets or courses to close the gap.',
    },
    {
      question: 'How many free analyses per day?',
      answer: 'Free users get 3 skills gap analyses per day. Pro removes daily limits across tools.',
    },
  ],
  'scam-detector': [
    {
      question: 'What job scams does this catch?',
      answer:
        'Suspicious WhatsApp offers, upfront fee requests, vague company details, unrealistic salaries, and copy-paste phishing patterns common in India.',
    },
    {
      question: 'Is job scam detector free?',
      answer: 'Yes — unlimited free checks. Paste the offer message or JD and get a risk breakdown.',
    },
  ],
}

export { getCareerToolDemoSamples } from '@/lib/tools/marketing/demo-previews'

export function getCareerToolFaq(
  slug: ToolSlug,
  headline: string,
  whatItDoes: string,
  freeVsPro: string,
): CareerToolFaq[] {
  const custom = FAQ_BY_SLUG[slug]
  if (custom?.length) {
    return [
      { question: `What does ${headline} do?`, answer: whatItDoes },
      ...custom,
      { question: 'What are the free vs Pro limits?', answer: freeVsPro },
    ]
  }

  return [
    { question: `What does ${headline} do?`, answer: whatItDoes },
    { question: 'Do I need to sign in?', answer: 'Yes — sign in free to save your CV once and reuse it across all 29 career tools.' },
    { question: 'What are the free vs Pro limits?', answer: freeVsPro },
    {
      question: 'How is this different from ChatGPT?',
      answer:
        'MyCVRoast keeps your CV in one dashboard and generates output tailored to Indian job search — applications, interviews, and offers in one place.',
    },
  ]
}

export const CAREER_HUB_FAQ: CareerToolFaq[] = [
  {
    question: 'What are MyCVRoast career tools?',
    answer:
      '29 AI tools in your dashboard — mock interviews, JD matching, cover letters, salary scripts, resignation letters, and more. Built for Indian job seekers.',
  },
  {
    question: 'Do I need to pay for career tools?',
    answer:
      'Many tools have a free tier (cover letter, JD match, skills gap, resignation, thank-you emails, and more). Pro unlocks unlimited use on all tools including mock interview and salary negotiation.',
  },
  {
    question: 'Do I upload my CV for every tool?',
    answer:
      'No. Upload or paste your CV once in the dashboard — every tool reuses it for tailored output.',
  },
]
