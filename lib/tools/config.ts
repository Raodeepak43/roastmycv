import type { IntensityKey } from '@/app/i18n'

export type ToolFaq = { question: string; answer: string }

export type SampleRoast = {
  score: number
  line: string
  label?: string
}

export type ToolPageConfig = {
  slug: string
  title: string
  metaDescription: string
  keywords: string
  h1: string
  intro: string[]
  bullets?: string[]
  callouts?: { title: string; body: string }[]
  defaultLanguage: string
  defaultIntensity: IntensityKey
  hideLanguagePicker?: boolean
  hideIntensityPicker?: boolean
  languageNote?: string
  sampleRoasts?: SampleRoast[]
  faq?: ToolFaq[]
  relatedTools?: string[]
  relatedBlog?: string[]
}

export const TOOL_PAGES: ToolPageConfig[] = [
  {
    slug: 'resume-roast-in-hinglish',
    title: 'Resume Roast in Hinglish — Free AI Feedback | MyCVRoast',
    metaDescription:
      'Get your resume roasted in Hinglish — brutally honest, free AI feedback in 30 seconds. No signup.',
    keywords: 'resume roast in hinglish, hinglish resume roast, ai resume feedback hinglish',
    h1: 'Resume Roast in Hinglish — Free AI Feedback',
    intro: [
      'Hinglish roast matlab AI tumhari CV ko desi style mein todega — Hindi aur English mix mein, jaise dost honestly bolta hai.',
      'Upload karo, Hinglish pre-selected hai. 30 seconds mein score, roast lines, aur fix list milegi.',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'gaali_light',
    hideLanguagePicker: true,
    sampleRoasts: [
      { score: 3, line: 'Bhai objective line "hardworking team player" — yeh 2010 ka template hai yaar.', label: 'Fresher CV' },
      { score: 4, line: 'Skills section mein MS Word likha hai… matlab kuch aur nahi aata?', label: 'Generic skills' },
      { score: 2, line: 'CGPA 7.2 chhupa ke rakha hai aur projects section blank — recruiter ko kya dikhega?', label: 'BTech resume' },
    ],
    faq: [
      { question: 'Hinglish roast kya hota hai?', answer: 'AI aapki resume ko Hindi-English mix mein brutally honest feedback deta hai — campus placement aur Indian job market ke context mein.' },
      { question: 'Kya signup chahiye?', answer: 'Nahi. Pehle 2 roasts free, bina email ke.' },
      { question: 'Pure Hindi milega ya Hinglish?', answer: 'Output natural Hinglish hai — jaise Indian millennials bolte hain. Formal pure Hindi ke liye English mode try karo.' },
    ],
    relatedTools: ['free-resume-roast-india', 'resume-feedback-in-hindi'],
    relatedBlog: ['hinglish-resume-kaise-banaye', 'what-is-resume-roast'],
  },
  {
    slug: 'free-resume-roast-india',
    title: 'Free Resume Roast for Indian Job Seekers | MyCVRoast',
    metaDescription:
      'Free AI resume roast built for Indian freshers, students & job seekers. INR pricing, campus context, no signup for first roasts.',
    keywords: 'free resume roast india, resume roast india, ai resume review india free',
    h1: 'Free Resume Roast for Indian Job Seekers',
    intro: [
      'Built for Indian freshers, campus placements, and off-campus hunters — not generic US resume advice.',
      'Free tier: 2 roasts per device, no signup. Pro unlock: unlimited roasts at ₹149 one-time (approx. $1.80 USD).',
    ],
    bullets: [
      'Understands Indian formats — CGPA, internships, TPO deadlines',
      'Works with PDF/TXT from Naukri, LinkedIn export, college templates',
      'Feedback in 15 languages including Hinglish',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'gaali_light',
    faq: [
      {
        question: 'Is resume roast free in India?',
        answer:
          'Yes — MyCVRoast offers 2 free resume roasts per device with no signup. Built for Indian freshers, campus placement, and off-campus job seekers.',
      },
      {
        question: 'How is MyCVRoast different from Resume Worded or Jobscan?',
        answer:
          'Resume Worded and Jobscan score generic metrics. MyCVRoast roasts YOUR specific bullets in Hinglish — brutally honest feedback, not template tips. See our comparison guide.',
      },
      {
        question: 'Does it work with Naukri and campus CV formats?',
        answer:
          'Yes. Upload PDF or TXT from Naukri export, college TPO templates, or LinkedIn. AI understands CGPA, internships, and Indian fresher context.',
      },
    ],
    relatedTools: ['resume-roast-in-hinglish', 'campus-placement-resume-checker'],
    relatedBlog: ['free-resume-checker-india', 'campus-placement-resume-tips', 'mycvroast-vs-jobscan-vs-resume-worded'],
  },
  {
    slug: 'resume-feedback-in-hindi',
    title: 'Resume Feedback in Hindi (हिंदी) — Free AI Review | MyCVRoast',
    metaDescription:
      'Free AI resume feedback in Hindi-friendly Hinglish. Upload PDF — get honest review in seconds. Built for Indian students.',
    keywords: 'resume feedback in hindi, hindi resume review, resume check hindi',
    h1: 'Resume Feedback in Hindi (हिंदी) — Free AI Review',
    intro: [
      'Indian students often want feedback in Hindi — not corporate English jargon.',
      'MyCVRoast outputs natural Hinglish (Hindi + English mix). Formal Hindi-heavy lines included where it reads naturally.',
    ],
    languageNote:
      'Note: Our Hindi mode uses Hinglish — the way most Indian recruiters and students actually communicate. Pure formal Hindi-only output is coming soon; for now this is the most natural fit for campus and IT hiring in India.',
    defaultLanguage: 'hinglish',
    defaultIntensity: 'clean',
    hideLanguagePicker: true,
    sampleRoasts: [
      { score: 4, line: 'Summary mein "quick learner" likha hai — proof kahan hai bhai?', label: 'Hindi-medium background' },
      { score: 3, line: 'Project description sirf "e-commerce website" — tech stack aur tumhara role kya tha?', label: 'Fresher project' },
    ],
    faq: [
      { question: 'Kya feedback pure Hindi mein aayega?', answer: 'Abhi output Hinglish mein hai — Hindi aur English ka natural mix. Yeh Indian job market ke liye zyada readable hai.' },
      { question: 'Resume Hindi mein likhi hai toh?', answer: 'PDF upload karo — AI text extract karke review karega. Best results ke liye English/Hinglish resume recommended for MNC ATS.' },
    ],
    relatedTools: ['resume-roast-in-hinglish', 'free-resume-roast-india'],
  },
  {
    slug: 'ats-score-checker-for-freshers',
    title: 'Free ATS Score Checker for Freshers | MyCVRoast',
    metaDescription:
      'ATS score checker tuned for 0-experience fresher resumes — projects, CGPA, skills weighted differently than senior CVs.',
    keywords: 'ats score checker for freshers, ats checker fresher, resume ats score free',
    h1: 'Free ATS Score Checker for Freshers',
    intro: [
      'Freshers get judged differently — no 5-year work history expected. This checker frames feedback for 0–1 year experience profiles.',
      'Upload your campus or off-campus resume. Get a /10 score plus specific fixes recruiters and ATS bots care about.',
    ],
    bullets: [
      'Generic "team player" objectives flagged',
      'Missing project metrics and tech keywords highlighted',
      'One-page layout and parse-friendly formatting checked',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'clean',
    relatedTools: ['campus-placement-resume-checker', 'first-job-resume-no-experience'],
    relatedBlog: ['fresher-resume-format', 'ats-friendly-resume', 'btech-fresher-resume-mistakes'],
  },
  {
    slug: 'campus-placement-resume-checker',
    title: 'Free Campus Placement Resume Checker | MyCVRoast',
    metaDescription:
      'Free campus placement resume checker for TCS, Infosys, Wipro, Cognizant, Accenture drives. One-page rule, TPO-ready feedback.',
    keywords: 'campus placement resume checker free, placement resume check, campus cv checker',
    h1: 'Free Campus Placement Resume Checker',
    intro: [
      'Campus drives move fast — TPO deadline, company eligibility, one PDF upload. This checker matches what mass recruiters scan in 6–10 seconds.',
    ],
    bullets: [
      'One-page rule for most service-company drives',
      'CGPA, backlogs, and project proof visibility',
      'ATS-safe formatting (no Canva columns that break parsers)',
      'Objective/summary tuned for TCS / Infosys / Wipro / Cognizant / Accenture volume hiring',
    ],
    callouts: [{ title: '1-page rule', body: 'Unless TPO explicitly allows 2 pages, keep campus CV to one page. Recruiters at mega-drives do not flip pages.' }],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'clean',
    relatedTools: ['ats-resume-checker-tcs-infosys-wipro-fresher', 'ats-score-checker-for-freshers'],
    relatedBlog: ['campus-placement-resume-tips', 'btech-fresher-resume-mistakes'],
  },
  {
    slug: 'first-job-resume-no-experience',
    title: 'Resume With No Experience? Here\'s What Actually Works | MyCVRoast',
    metaDescription:
      'First job resume with no experience in India — projects, internships & coursework count. Free AI review + examples that work.',
    keywords: 'first job resume no experience india, resume no experience, fresher no experience',
    h1: 'First Job Resume With No Experience — What Actually Works',
    intro: [
      '"No experience" does not mean empty resume. Indian recruiters expect projects, internships, hackathons, and coursework — framed with metrics.',
    ],
    bullets: [
      'Replace "seeking opportunity" with a 2-line summary + target role',
      'List 2–3 projects with stack, your role, and outcome',
      'Add internship/volunteering even if unpaid — duration + tasks matter',
      'Skills: group technical vs soft; match job description keywords',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'gaali_light',
    relatedTools: ['internship-resume-review', 'ats-score-checker-for-freshers'],
    relatedBlog: ['resume-with-no-experience', 'internship-resume-guide', 'fresher-resume-format'],
  },
  {
    slug: 'internship-resume-review',
    title: 'Free AI Internship Resume Review | MyCVRoast',
    metaDescription:
      'Free AI internship resume review — tuned for Internshala-style applications, shorter experience bars, project-heavy CVs.',
    keywords: 'internship resume review free ai, internship cv check, intern resume review',
    h1: 'Free AI Internship Resume Review',
    intro: [
      'Internship applications are not full-time job CVs — shorter timeline, project proof, and willingness to learn matter more than years of experience.',
      'Upload your internship resume. Get feedback tuned for startup and MNC intern pipelines.',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'gaali_light',
    relatedTools: ['first-job-resume-no-experience', 'campus-placement-resume-checker'],
    relatedBlog: ['internship-resume-guide', 'student-resume-guide'],
  },
  {
    slug: 'resume-score-check-no-signup',
    title: 'Resume Score Check — No Signup Required | MyCVRoast',
    metaDescription:
      'Check your resume score free — no login, no email, no credit card. Instant AI score out of 10 with fixes.',
    keywords: 'resume score check free no signup, resume score without login, free resume score',
    h1: 'Resume Score Check — No Signup Required',
    intro: [
      'No login. No email gate. No credit card before you see your score.',
      'Unlike tools that hide results behind signup, MyCVRoast shows your /10 score and fixes on the first roast — free.',
    ],
    callouts: [{ title: 'Differentiator', body: 'Upload → score + roast + 3 fixes in ~30 seconds. Account optional, not mandatory.' }],
    defaultLanguage: 'english',
    defaultIntensity: 'clean',
    hideLanguagePicker: false,
    relatedTools: ['free-resume-roast-india', 'brutal-resume-feedback'],
    relatedBlog: ['free-resume-checker-india', 'what-is-resume-roast'],
  },
  {
    slug: 'brutal-resume-feedback',
    title: 'Brutal Resume Feedback — No Sugarcoating | MyCVRoast',
    metaDescription:
      'Get brutal, honest resume feedback — no sugarcoating. AI tells you what recruiters actually think. Free, instant.',
    keywords: 'brutal resume feedback free, honest resume feedback, harsh resume review',
    h1: 'Brutal Resume Feedback — No Sugarcoating',
    intro: [
      'We do not soften it. Generic "add more keywords" advice is useless — you get line-by-line criticism referencing YOUR resume.',
      'Pick Clean mode for professional savage, or Gaali Light / Savage for stronger tone.',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'savage',
    relatedTools: ['resume-roast-comedian-style', 'resume-score-check-no-signup'],
    relatedBlog: ['what-is-resume-roast', 'resume-roast-vs-resume-review'],
  },
  {
    slug: 'resume-roast-engineering-students',
    title: 'Resume Roast for Engineering Students | MyCVRoast',
    metaDescription:
      'AI resume roast for BTech/BE engineering students — CGPA, projects, GitHub, and coding skills reviewed honestly.',
    keywords: 'resume roast for engineering students, btech resume roast, engineering cv review',
    h1: 'Resume Roast for Engineering Students',
    intro: [
      'Engineering resumes live or die on projects, CGPA visibility, tech stack, and GitHub — not generic soft skills lists.',
    ],
    sampleRoasts: [
      { score: 3, line: 'Final year project "Library Management System" with zero tech stack mentioned — 2015 called.', label: 'BTech CSE' },
      { score: 5, line: 'CGPA 8.4 buried in footer but "proficient in C, C++, Java, Python, JS" with no project proof.', label: 'ECE fresher' },
      { score: 4, line: 'GitHub link missing — for SDE roles this is half your portfolio missing.', label: 'CS placement' },
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'gaali_light',
    relatedTools: ['campus-placement-resume-checker', 'ats-score-checker-for-freshers'],
    relatedBlog: ['btech-fresher-resume-mistakes', 'engineering-resume-guide', 'software-engineer-resume-guide'],
  },
  {
    slug: 'resume-roast-comedian-style',
    title: 'Comedian-Style Resume Roast | MyCVRoast',
    metaDescription:
      'Comedian-style resume roast — funny, savage, shareable. Upload CV, pick Savage mode, get roasted like a stand-up set.',
    keywords: 'resume roast comedian style, funny resume roast, comedy resume review',
    h1: 'Comedian-Style Resume Roast',
    intro: [
      'Want feedback that hits like a roast show? Savage mode + Hinglish = shareable pain.',
      'Still get a real score and fix list at the end — comedy with actionable value.',
    ],
    sampleRoasts: [
      { score: 2, line: 'Teri resume ne recruiter ko sleep mode pe bhej diya — objective line literally "To work in a reputed organization". Comedy gold, job zero.', label: 'Savage sample' },
      { score: 3, line: 'Skills: "Microsoft Office, Internet surfing" — bhai yeh resume hai ya 2008 cyber cafe form?', label: 'Savage sample' },
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'savage',
    hideIntensityPicker: false,
    relatedTools: ['brutal-resume-feedback', 'resume-roast-in-hinglish'],
    relatedBlog: ['what-is-resume-roast', 'resume-roast-vs-resume-review'],
  },
  {
    slug: 'ats-resume-checker-tcs-infosys-wipro-fresher',
    title: 'ATS Resume Checker for TCS, Infosys, Wipro Freshers | MyCVRoast',
    metaDescription:
      'ATS resume checker for TCS, Infosys, Wipro, Cognizant fresher hiring — high-volume campus ATS, one-page CV rules.',
    keywords: 'ats resume checker tcs infosys wipro fresher, campus ats checker, service company resume',
    h1: 'ATS Resume Checker for TCS, Infosys & Wipro Freshers',
    intro: [
      'TCS, Infosys, Wipro, Cognizant, and Accenture hire thousands of freshers per cycle — ATS + human screen in under 10 seconds.',
      'This checker focuses on parse-safe layout, keyword match, and fresher-weighted scoring.',
    ],
    bullets: [
      'Single-column, PDF-parse-friendly layout',
      'Role keywords: Java, Python, SQL, testing basics as per your branch',
      'No photo/graphics that break Taleo/iCIMS parsers',
    ],
    defaultLanguage: 'hinglish',
    defaultIntensity: 'clean',
    relatedTools: ['campus-placement-resume-checker', 'ats-score-checker-for-freshers'],
    relatedBlog: ['campus-placement-resume-tips', 'ats-friendly-resume', 'it-jobs-resume-guide'],
  },
]

export function getToolBySlug(slug: string): ToolPageConfig | undefined {
  return TOOL_PAGES.find((t) => t.slug === slug)
}

export function getAllToolSlugs(): string[] {
  return TOOL_PAGES.map((t) => t.slug)
}
