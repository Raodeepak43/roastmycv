#!/usr/bin/env node
/**
 * Generates one SEO blog post per dashboard AI tool.
 * Run: node scripts/generate-tool-blogs.mjs
 */
import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

const TOOLS = [
  {
    slug: 'skills-gap-analyser-tool',
    toolSlug: 'skills-gap',
    title: 'Skills Gap Analyser: Find What Your Target Role Needs in 2026',
    description:
      'Free AI skills gap analyser for Indian job seekers. Compare your CV to any target role, see missing skills, and get a learning plan with real courses.',
    keywords: 'skills gap analysis, skills gap analyser, career skills gap, missing skills resume, upskilling plan',
    h1: 'Skills Gap Analyser',
    path: '/dashboard/tools/skills-gap',
    icon: '🔍',
    intro:
      'You keep applying but never get shortlisted. Often the problem is not your degree — it is a **skills gap** between your CV and what employers actually list in job descriptions. A skills gap analyser reads your resume and target role, then shows exactly what you have, what you are missing, and how to close the gap fast.',
    what: 'The MyCVRoast **Skills Gap** tool uploads your CV and target job title (or role description). AI compares your listed skills and experience against typical requirements for that role in India and globally. You get: skills you already match, missing skills ranked by employer demand, and a practical learning plan for the top 3 gaps — with named free resources like NPTEL, Coursera, and YouTube channels.',
    steps: [
      'Sign in to MyCVRoast and open **Skills Gap** from your dashboard.',
      'Paste or upload your CV text.',
      'Enter your target role (e.g. "Data Analyst", "SDE-1", "Digital Marketing Executive").',
      'Review missing skills and follow the suggested learning plan.',
      'Update your resume after completing 1–2 courses, then re-run a [free resume roast](/).',
    ],
    who: 'Freshers pivoting roles, experienced professionals switching industries, and anyone who gets "we went with another candidate" without feedback.',
    free: '3 free analyses per day on the free plan.',
    related: ['ai-resume-review-india', 'software-engineer-resume-guide', 'data-analyst-resume-guide'],
  },
  {
    slug: 'career-gap-explainer-tool',
    toolSlug: 'gap-explainer',
    title: 'Career Gap Explainer: How to Address Employment Gaps on Your CV',
    description:
      'AI career gap explainer for resume gaps — health, layoff, study break, or family. Get honest bullet points recruiters accept in India.',
    keywords: 'career gap resume, employment gap explanation, resume gap year, career break cv india',
    h1: 'Gap Explainer',
    path: '/dashboard/tools/gap-explainer',
    icon: '⏸️',
    intro:
      'A six-month gap after graduation. A layoff. Maternity leave. Health issues. Indian recruiters notice gaps in seconds — and most candidates either hide them (which backfires) or write vague excuses. The **Gap Explainer** tool turns your real story into professional, honest CV language that does not sound defensive.',
    what: 'Paste your CV and describe the gap (dates, reason, what you did during the break). AI generates 2–3 resume-ready explanations: one-line summary for your cover letter, a bullet for your experience section if relevant, and talking points for interviews. It avoids lies and corporate fluff.',
    steps: [
      'Open **Gap Explainer** in the MyCVRoast dashboard.',
      'Add your CV and gap details (duration + context).',
      'Copy the suggested phrasing into your resume or LinkedIn.',
      'Practice the interview version out loud before HR calls.',
    ],
    who: 'Anyone with 3+ months unexplained on their CV — especially post-COVID career breaks and freshers who took time after college.',
    free: 'Unlimited on free plan.',
    related: ['resume-mistakes-to-avoid', 'how-to-write-a-cv', 'job-interview-preparation'],
  },
  {
    slug: 'ai-linkedin-about-writer',
    toolSlug: 'linkedin',
    title: 'AI LinkedIn About Writer: 3 Profile Versions From Your CV',
    description:
      'Generate LinkedIn About sections from your resume — storytelling, achievement-led, and keyword-optimised versions for recruiter search in India.',
    keywords: 'linkedin about section, linkedin profile writer ai, linkedin summary generator, linkedin about me',
    h1: 'LinkedIn Writer',
    path: '/dashboard/tools/linkedin',
    icon: '💼',
    intro:
      'Your LinkedIn About section is empty or still says "Aspiring professional seeking opportunities." Recruiters search LinkedIn by keywords — a weak About means invisible profile. The **LinkedIn Writer** turns your CV into three distinct About sections you can paste and edit in minutes.',
    what: 'Upload your CV. AI writes three 150–200 word About versions: (1) storytelling arc — who you are and where you are going, (2) achievement-first with bullet highlights, (3) keyword-heavy for recruiter search. No "passionate team player" filler.',
    steps: [
      'Open **LinkedIn Writer** from the dashboard.',
      'Paste your CV.',
      'Pick the version that fits your personality.',
      'Customise names, metrics, and tone, then paste into LinkedIn.',
      'Pair with our [LinkedIn profile optimization guide](/blog/linkedin-profile-optimization).',
    ],
    who: 'Students, freshers, and professionals who have a decent CV but a weak LinkedIn presence.',
    free: '2 free generations per day.',
    related: ['linkedin-profile-optimization', 'linkedin-profile-roast', 'resume-skills-section'],
  },
  {
    slug: 'jd-match-ats-score-tool',
    toolSlug: 'jd-match',
    title: 'JD Match Tool: ATS Score Your Resume Against Any Job Description',
    description:
      'Match your CV to a job description with an ATS score out of 100. See missing keywords, rewrites, and what to cut — free for Indian job seekers.',
    keywords: 'jd match resume, ats score job description, resume keyword match, cv job description match',
    h1: 'Job Match (JD Match)',
    path: '/dashboard/tools/jd-match',
    icon: '🎯',
    intro:
      'You send the same CV to 50 companies and hear nothing. ATS systems at TCS, Amazon India, and startups rank candidates by **keyword match** to the job description. The **JD Match** tool scores your CV against any pasted JD and tells you exactly what to add, rewrite, or remove.',
    what: 'Provide your CV + full job description. AI returns: ATS match score (0–100), missing keywords, keywords you already have, specific bullet rewrites to add terms naturally, and irrelevant content to delete. This is the highest-ROI edit before any application.',
    steps: [
      'Copy the full job posting from Naukri, LinkedIn, or the company site.',
      'Open **Job Match** and paste CV + JD.',
      'Fix the top 3 missing keywords first.',
      'Re-run until you hit 75+ for serious applications.',
    ],
    who: 'Anyone applying to a specific role they care about — not spray-and-pray applicants.',
    free: '2 free matches on the free plan.',
    related: ['ats-friendly-resume', 'why-ats-rejects-resume-india-fresher', 'ai-resume-review-india'],
  },
  {
    slug: 'resume-bullet-rewriter-ai',
    toolSlug: 'cv-rewriter',
    title: 'Resume Bullet Rewriter: Turn Weak Lines Into Metric-Driven Bullets',
    description:
      'AI resume bullet rewriter for Indian CVs. Fix vague experience lines with action verbs, numbers, and ATS-friendly phrasing in seconds.',
    keywords: 'resume bullet rewriter, cv bullet points ai, resume bullet point generator, weak resume bullets',
    h1: 'Bullet Rewriter',
    path: '/dashboard/tools/cv-rewriter',
    icon: '✨',
    intro:
      '"Worked on various projects" and "Responsible for team coordination" are resume killers. Recruiters want **metrics, action verbs, and outcomes**. The **Bullet Rewriter** takes your existing bullets and returns stronger versions grounded in what you actually did — without inventing fake numbers.',
    what: 'Paste weak bullets from your CV. AI rewrites each with stronger verbs, clearer scope, and suggested metrics placeholders where you should add real data. Keeps facts from your CV — does not hallucinate employers or titles.',
    steps: [
      'Copy 3–5 weak bullets from your experience or projects section.',
      'Open **Bullet Rewriter** and paste them.',
      'Replace [X%] placeholders with your real numbers.',
      'Update your CV in the [free resume builder](/resume-builder).',
    ],
    who: 'Freshers with empty-looking project sections and professionals whose bullets read like job descriptions.',
    free: '5 rewrites per day on free plan.',
    related: ['resume-action-verbs', 'work-experience-resume-section', 'project-manager-resume-guide'],
  },
  {
    slug: 'ai-cover-letter-generator',
    toolSlug: 'cover-letter',
    title: 'AI Cover Letter Generator: Tailored Letters From Your CV + JD',
    description:
      'Write a cover letter matched to your CV and job description in under a minute. No generic "I am writing to apply" openers.',
    keywords: 'ai cover letter generator, cover letter from resume, tailored cover letter, cover letter job description',
    h1: 'Cover Letter Generator',
    path: '/dashboard/tools/cover-letter',
    icon: '📝',
    intro:
      'Most cover letters are copy-paste disasters. Hiring managers spot generic letters in one line. A good cover letter connects **your CV achievements** to **this specific job** — and the **Cover Letter** tool does that automatically.',
    what: 'Paste your CV and job description. Choose tone (professional, confident, or concise). AI writes a ~250-word letter with: company-specific opening, 2–3 CV achievements mapped to JD requirements, and a clear call to action. No fabricated experience.',
    steps: [
      'Run **JD Match** first if you have not tailored your CV yet.',
      'Open **Cover Letter**, paste CV + JD + company name.',
      'Edit the output — add one personal detail the AI cannot know.',
      'Save as PDF or paste into the application portal.',
    ],
    who: 'Roles where cover letters are expected — consulting, marketing, government, and senior individual contributor roles.',
    free: '1 free cover letter on the free plan.',
    related: ['how-to-write-cover-letter', 'cover-letter-for-resume-guide', 'jd-match-ats-score-tool'],
  },
  {
    slug: 'cold-email-recruiter-tool',
    toolSlug: 'cold-email',
    title: 'Cold Email to Recruiters: AI Outreach That Gets Replies',
    description:
      'Write cold emails to recruiters under 150 words — specific subject lines, one achievement, clear ask. Built for Indian job hunt outreach.',
    keywords: 'cold email recruiter, outreach email job search, email recruiter for job, cold email template job',
    h1: 'Cold Email',
    path: '/dashboard/tools/cold-email',
    icon: '📧',
    intro:
      'LinkedIn Easy Apply is a black hole. A sharp **cold email** to a recruiter or hiring manager can skip the queue — if it is under 150 words, specific, and not "Dear Sir/Madam I hope this email finds you well." The **Cold Email** tool writes human outreach from your CV.',
    what: 'Provide CV, target company, role, and recruiter name if known. AI outputs: subject line (specific, not "Job Application"), 120-word body with one quantified achievement, and a 15-minute call ask. Sounds like a person, not a mail merge.',
    steps: [
      'Research the company — one real detail helps (product launch, funding, blog post).',
      'Generate the email in **Cold Email**.',
      'Send from a professional address, Tuesday–Thursday morning IST.',
      'Follow up once after 5 business days using the **Follow-Up** tool.',
    ],
    who: 'Mid-level professionals, niche role seekers, and anyone targeting dream companies directly.',
    free: 'Pro plan feature.',
    related: ['how-to-find-a-job-india', 'linkedin-profile-optimization', 'job-application-follow-up-email'],
  },
  {
    slug: 'salary-negotiation-script-ai',
    toolSlug: 'salary',
    title: 'Salary Negotiation Script: What to Say When HR Names a Number',
    description:
      'AI salary negotiation scripts for India — counter offers, competing offers, and fresher packages. Word-for-word lines that stay professional.',
    keywords: 'salary negotiation script, how to negotiate salary india, counter offer script, salary discussion hr',
    h1: 'Salary Script',
    path: '/dashboard/tools/salary',
    icon: '💰',
    intro:
      'HR says "This is our best offer." Most candidates say "Okay." That one moment can cost you ₹2–5 LPA over three years. The **Salary Script** tool generates negotiation language tailored to your role, experience, and market — so you know exactly what to say on the call.',
    what: 'Enter your offer details, role, location, and any competing offer. AI produces: opening response to the first number, counter-offer framing with data points, scripts for "budget is fixed," and email follow-up text. Calibrated for Indian salary conversations (CTC, ESOPs, joining bonus).',
    steps: [
      'Research market range on AmbitionBox / Glassdoor before the call.',
      'Generate scripts in **Salary Script**.',
      'Practice out loud — negotiate tone, not aggression.',
      'Use **Offer Comparator** if you have multiple offers.',
    ],
    who: 'Anyone who received an offer in the last 7 days — especially first job and job-switchers.',
    free: 'Pro plan feature.',
    related: ['job-offer-comparator-tool', 'first-90-days-plan-tool', 'remote-jobs-india-guide'],
  },
  {
    slug: 'ai-interview-prep-questions',
    toolSlug: 'interview-prep',
    title: 'AI Interview Prep: Questions You Will Actually Be Asked',
    description:
      'Generate 10–12 interview questions from your CV and target role — behavioural, technical, and CV-specific with answer frameworks.',
    keywords: 'interview prep ai, interview questions from resume, behavioural interview prep, cv based interview questions',
    h1: 'Interview Prep',
    path: '/dashboard/tools/interview-prep',
    icon: '🎤',
    intro:
      'Generic interview question lists on Google do not know you had a 8-month gap, switched from mechanical to IT, or led a college fest with 500 attendees. **Interview Prep** reads your CV and generates questions interviewers will ask **you** — with answer frameworks using your real experience.',
    what: 'Upload CV + target role. AI groups 10–12 likely questions into: Behavioural, Technical, CV-specific, and Situational. Each includes why they ask it and a STAR-style answer skeleton from your bullets.',
    steps: [
      'Run prep 3–5 days before the interview.',
      'Write bullet answers — do not memorise word-for-word.',
      'Do a **Mock Interview** session for practice under pressure.',
      'After the interview, run **Interview Debrief**.',
    ],
    who: 'Campus placement, off-campus, and lateral hire candidates at any level.',
    free: 'Pro plan feature.',
    related: ['job-interview-preparation', 'ai-mock-interview-tool', 'interview-debrief-tool'],
  },
  {
    slug: 'ai-mock-interview-tool',
    toolSlug: 'mock-interview',
    title: 'AI Mock Interview: Practice With an Interviewer Who Read Your CV',
    description:
      'Mock interview simulator powered by AI — technical, HR, or mixed rounds. Answers evaluated against your resume and target role.',
    keywords: 'mock interview ai, online mock interview, practice interview ai, mock hr interview',
    h1: 'Mock Interview',
    path: '/dashboard/tools/mock-interview',
    icon: '🎙️',
    intro:
      'Reading questions is not the same as answering under pressure. **Mock Interview** simulates a real round: AI asks follow-ups, probes weak CV areas, and gives feedback on clarity and structure — before the actual call with a hiring manager. Turn on **Voice mode** for a natural ElevenLabs interviewer that reads questions aloud (George, Rachel, and more). Answer by **typing or speaking** — mic auto-sends after a short pause.',
    what: 'Choose interview style (HR, Technical, Mixed) and role. AI acts as interviewer with your CV in context — asks questions, responds to your answers, and summarises strengths and fixes at the end. With voice enabled, questions stay hidden until audio starts so you practice real timing. Pick your interviewer voice and hear a demo before you begin.',
    steps: [
      'Complete **Interview Prep** first for question familiarity.',
      'Open **Mock Interview**, pick voice (optional) and interview style.',
      'Answer out loud with the mic or type — both work.',
      'Review feedback and redo weak answers before the real call.',
    ],
    who: 'Candidates who freeze in interviews despite knowing the material.',
    free: 'Pro plan feature.',
    related: ['ai-interview-prep-questions', 'voice-mock-interview-tool', 'job-interview-preparation'],
  },
  {
    slug: 'thank-you-email-after-interview',
    toolSlug: 'thank-you',
    title: 'Thank You Email After Interview: Templates That Stand Out',
    description:
      'Write a thank-you email after interview in 60 seconds — references the conversation, reinforces fit, and stays under 120 words.',
    keywords: 'thank you email after interview, post interview thank you, interview follow up thank you email',
    h1: 'Thank You Email',
    path: '/dashboard/tools/thank-you',
    icon: '✉️',
    intro:
      'Sending a thank-you email within 24 hours puts you ahead of 70% of candidates who never follow up. It is not grovelling — it is professional closure plus one more chance to reinforce why you fit. The **Thank You Email** tool writes it from your CV and interview notes.',
    what: 'Paste CV, role, interviewer name, and 2–3 things discussed. AI writes a concise thank-you: references specific conversation points, ties one CV achievement to the role, and closes warmly. No essay length.',
    steps: [
      'Send within 24 hours of the interview.',
      'Personalise one line the AI cannot know (inside joke, shared interest).',
      'One email to all panelists BCC if needed — or separate short notes.',
    ],
    who: 'Anyone who completed a phone screen, technical round, or final HR round.',
    free: 'Unlimited on free plan.',
    related: ['job-application-follow-up-email', 'interview-debrief-tool', 'job-interview-preparation'],
  },
  {
    slug: 'job-application-follow-up-email',
    toolSlug: 'follow-up',
    title: 'Job Application Follow-Up Email: When and What to Write',
    description:
      'Follow-up email after applying or interviewing — professional nudge templates for Indian job search without sounding desperate.',
    keywords: 'follow up email job application, application follow up, follow up after interview no response',
    h1: 'Follow-Up Email',
    path: '/dashboard/tools/follow-up',
    icon: '📬',
    intro:
      'Applied two weeks ago. Silence. A single **follow-up email** can resurface your application — if it is timed right and does not read like "please please hire me." The **Follow-Up** tool writes context-aware nudges for post-application or post-interview scenarios.',
    what: 'Select scenario (applied, no response / post-interview / post-offer delay). Add CV, role, company, and timeline. AI drafts a short, confident follow-up with clear ask and professional tone.',
    steps: [
      'First follow-up: 7–10 business days after applying.',
      'Second follow-up: 14 days after first — then stop.',
      'After interview: 5 days if no update promised.',
    ],
    who: 'Active job seekers managing 20+ applications who lose track of timelines.',
    free: 'Unlimited on free plan.',
    related: ['thank-you-email-after-interview', 'how-to-find-a-job-india', 'cold-email-recruiter-tool'],
  },
  {
    slug: 'rejection-email-reply-tool',
    toolSlug: 'rejection',
    title: 'How to Reply to a Rejection Email (And Stay on Their Radar)',
    description:
      'Professional rejection reply templates — gracious, brief, and smart enough to leave the door open for future roles.',
    keywords: 'reply to rejection email, rejection email response, how to respond job rejection, rejection reply template',
    h1: 'Rejection Reply',
    path: '/dashboard/tools/rejection',
    icon: '💌',
    intro:
      'You got the "we regret to inform you" mail. Ignore it, or send a 3-sentence reply that hiring managers remember when the next role opens? **Rejection Reply** writes gracious responses that keep relationships warm — without arguing the decision.',
    what: 'Paste the rejection email context, role, and company. AI drafts a short reply: thanks, graceful acceptance, optional ask to stay in touch or request feedback. Professional — never bitter.',
    steps: [
      'Send within 48 hours.',
      'Do not ask "why was I rejected" unless they offered feedback.',
      'Connect on LinkedIn with a note if appropriate.',
      'Run **Rejection Analyser** if you keep getting rejected everywhere.',
    ],
    who: 'Anyone who wants to build long-term recruiter relationships in a tight market.',
    free: 'Unlimited on free plan.',
    related: ['rejection-analyser-tool', 'no-interview-calls-after-50-applications', 'why-resume-not-getting-shortlisted'],
  },
  {
    slug: 'elevator-pitch-generator',
    toolSlug: 'elevator-pitch',
    title: 'Elevator Pitch Generator: Introduce Yourself in 30 Seconds',
    description:
      'AI elevator pitch from your CV — for networking events, "tell me about yourself," and LinkedIn DMs. Clear, confident, no jargon.',
    keywords: 'elevator pitch generator, tell me about yourself answer, 30 second introduction, networking pitch',
    h1: 'Elevator Pitch',
    path: '/dashboard/tools/elevator-pitch',
    icon: '🎤',
    intro:
      '"Tell me about yourself" is not your life story. It is a **30-second pitch**: who you are, what you do best, and what you want next. The **Elevator Pitch** tool compresses your CV into spoken intro versions for interviews, campus fairs, and LinkedIn cold messages.',
    what: 'Paste CV and target audience (recruiter, technical panel, networking event). AI outputs 30-second and 60-second versions plus a one-line hook for DMs.',
    steps: [
      'Memorise structure, not script word-for-word.',
      'Practice with a timer — aim for 25–35 seconds.',
      'Adjust tone for campus vs. corporate networking.',
    ],
    who: 'Freshers, career switchers, and anyone who rambles when asked to introduce themselves.',
    free: 'Unlimited on free plan.',
    related: ['job-interview-preparation', 'ai-linkedin-about-writer', 'how-to-find-a-job-india'],
  },
  {
    slug: 'referral-request-email-tool',
    toolSlug: 'referral',
    title: 'Referral Request Email: Ask Without Being Awkward',
    description:
      'Write referral request emails to employees and alumni — specific, respectful, and easy for them to forward to HR.',
    keywords: 'referral request email, ask for referral, employee referral email template, referral message linkedin',
    h1: 'Referral Ask',
    path: '/dashboard/tools/referral',
    icon: '🤝',
    intro:
      'Referrals get 4× more responses than cold applications. But "Can you refer me?" to someone you met once at a webinar feels cringe. **Referral Ask** writes messages that make it **easy for them to say yes** — short, specific, with your CV highlights attached in text.',
    what: 'Enter connection context (alumni, ex-colleague, LinkedIn contact), target role, company, and CV summary. AI drafts LinkedIn DM and email versions with clear ask and low friction for the referrer.',
    steps: [
      'Warm up the connection first — comment on their post or congratulate a work anniversary.',
      'Send referral ask with JD link and 2-line CV summary.',
      'Make it forwardable — they should copy-paste to internal portal.',
    ],
    who: 'Candidates targeting specific companies where they have 1st or 2nd degree connections.',
    free: 'Pro plan feature.',
    related: ['cold-email-recruiter-tool', 'how-to-find-a-job-india', 'linkedin-profile-optimization'],
  },
  {
    slug: 'ai-career-path-planner',
    toolSlug: 'career-path',
    title: 'AI Career Path Planner: Routes From Your Current Role',
    description:
      'Explore career paths from your CV — next roles, skills to build, and realistic timelines for Indian job market 2026.',
    keywords: 'career path planner, career progression plan, next career move, career roadmap ai',
    h1: 'Career Paths',
    path: '/dashboard/tools/career-path',
    icon: '🗺️',
    intro:
      'Stuck as "Software Engineer" with no idea if you should go toward PM, DevOps, or engineering manager? **Career Paths** maps realistic next steps from your actual CV — not generic "learn leadership" advice.',
    what: 'Upload CV and optional interests. AI suggests 3–4 career paths with: typical next titles, skills gap per path, 12–24 month roadmap, and Indian market context (which paths hire more at your level).',
    steps: [
      'Pick one path — do not chase all four.',
      'Run **Skills Gap** for the chosen path.',
      'Update LinkedIn headline to match direction.',
    ],
    who: '2–7 year professionals feeling plateaued or considering a pivot.',
    free: 'Pro plan feature.',
    related: ['skills-gap-analyser-tool', 'ai-interview-prep-questions', 'remote-jobs-india-guide'],
  },
  {
    slug: 'linkedin-profile-audit-tool',
    toolSlug: 'linkedin-audit',
    title: 'LinkedIn Profile Audit: Section-by-Section Score and Fixes',
    description:
      'Full LinkedIn profile audit — headline, about, experience, skills, and recruiter search visibility. AI scores each section.',
    keywords: 'linkedin profile audit, linkedin profile review, linkedin score checker, linkedin profile analysis',
    h1: 'LinkedIn Audit',
    path: '/dashboard/tools/linkedin-audit',
    icon: '🔍',
    intro:
      'LinkedIn Writer fixes your About section. **LinkedIn Audit** reviews your **entire profile** — headline keyword density, experience bullets, skills order, banner, and recruiter discoverability — with a prioritized fix list.',
    what: 'Paste your full LinkedIn profile text (or export from CV). AI audits each section, scores strengths/weaknesses, and lists top 5 fixes ranked by impact on recruiter search.',
    steps: [
      'Copy all sections from LinkedIn into the tool.',
      'Fix headline and About first — highest ROI.',
      'Add skills recruiters search for your role.',
      'Try [LinkedIn Roast](/linkedin-roast) for brutal feedback.',
    ],
    who: 'Anyone who gets profile views but no InMails, or who has not updated LinkedIn in 12+ months.',
    free: 'Pro plan feature.',
    related: ['ai-linkedin-about-writer', 'linkedin-profile-optimization', 'linkedin-profile-roast'],
  },
  {
    slug: 'cv-localiser-international-jobs',
    toolSlug: 'cv-localise',
    title: 'CV Localiser: Adapt Your Resume for US, UK, EU, and Gulf Markets',
    description:
      'Localise your Indian CV for international job applications — format, sections, spelling, and cultural norms by country.',
    keywords: 'international cv format, localise resume, cv for us jobs, uk cv format from india',
    h1: 'CV Localiser',
    path: '/dashboard/tools/cv-localise',
    icon: '🌍',
    intro:
      'Your Indian CV with photo, 10th marks, and "father\'s name" will get rejected in the US and UK in seconds. **CV Localiser** adapts your content to target country conventions — not just spelling, but what to remove, add, and reorder.',
    what: 'Paste CV and select target country (US, UK, Canada, Germany, UAE, etc.). AI explains format rules, flags inappropriate content, suggests visa/status line if relevant, and outputs a localised CV draft.',
    steps: [
      'Remove photo and personal details not used abroad.',
      'Convert to 1–2 pages max for US/UK.',
      'Run **JD Match** on each international application separately.',
    ],
    who: 'Indian professionals applying abroad or to MNC regional offices.',
    free: 'Pro plan feature.',
    related: ['one-page-resume-compressor-tool', 'cv-vs-resume-difference', 'remote-jobs-india-guide'],
  },
  {
    slug: 'one-page-resume-compressor-tool',
    toolSlug: 'compress',
    title: '1-Page Resume Compressor: Cut Your CV Without Losing Impact',
    description:
      'AI resume compressor — fit 2-page CV to one page for freshers and experienced hires. Keeps strongest bullets, cuts fluff.',
    keywords: 'one page resume, compress resume, shorten cv, 2 page resume to 1 page',
    h1: '1-Page Compressor',
    path: '/dashboard/tools/compress',
    icon: '✂️',
    intro:
      'Recruiters prefer one page for freshers and under-7-year profiles. You have two pages of repetition, old internships, and "hobbies: reading." **1-Page Compressor** intelligently cuts and merges — keeping metrics and impact, removing filler.',
    what: 'Paste full CV. AI returns compressed version: merged bullets, removed redundancy, tighter summary, and notes on what was cut and why.',
    steps: [
      'Start from your strongest version — roast it first on [MyCVRoast](/).',
      'Manually verify nothing critical was removed.',
      'Export via [Resume Builder](/resume-builder).',
    ],
    who: 'Freshers with 2-page CVs and professionals applying to consulting/finance where brevity matters.',
    free: 'Pro plan feature.',
    related: ['one-page-resume-guide', 'resume-mistakes-to-avoid', 'resume-bullet-rewriter-ai'],
  },
  {
    slug: 'resume-bias-checker-tool',
    toolSlug: 'bias-check',
    title: 'Resume Bias Checker: Age, Gender, and Photo Flags on Your CV',
    description:
      'Detect unconscious bias triggers on your CV — photos, age hints, marital status, religion — for fair hiring in India and abroad.',
    keywords: 'resume bias checker, cv discrimination, resume photo india, unbiased resume',
    h1: 'Bias Detector',
    path: '/dashboard/tools/bias-check',
    icon: '🕵️',
    intro:
      'Indian CVs often include date of birth, photo, marital status, and religion — all of which can trigger **unconscious bias** and get you filtered before skills are read. Abroad, some of these are illegal to ask. **Bias Detector** flags risky content and suggests neutral alternatives.',
    what: 'Paste CV and target country. AI lists bias triggers: demographic hints, gendered language, age signals, caste/religion references, and photo recommendations. Suggests rewrites that keep facts without triggering filters.',
    steps: [
      'Remove photo for US/UK/EU applications.',
      'Replace "single/married" with nothing.',
      'Use **CV Localiser** for country-specific rules.',
    ],
    who: 'Women returning to workforce, older candidates, and anyone applying internationally from India.',
    free: 'Unlimited on free plan.',
    related: ['cv-localiser-international-jobs', 'resume-mistakes-to-avoid', 'fresher-resume-format'],
  },
  {
    slug: 'rejection-analyser-tool',
    toolSlug: 'rejection-analyser',
    title: 'Rejection Analyser: Find the Pattern Across All Your Job Applications',
    description:
      'Paste multiple job descriptions you were rejected from — AI finds the consistent gap in your CV across all of them.',
    keywords: 'why am i getting rejected jobs, rejection pattern resume, multiple job rejections, cv rejection analysis',
    h1: 'Rejection Analyser',
    path: '/dashboard/tools/rejection-analyser',
    icon: '🔎',
    intro:
      'One rejection might be bad luck. Ten rejections with zero interviews means a **pattern** — usually a missing skill, wrong title targeting, or CV keyword gap that repeats across every JD. **Rejection Analyser** compares your CV to multiple JDs you failed at and finds the common root cause.',
    what: 'Paste CV + 3–5 job descriptions you applied to but did not get. AI identifies skills/keywords that appear in multiple JDs but are missing or weak in your CV. One primary root cause + quick fixes.',
    steps: [
      'Save JDs when you apply — build a rejection library.',
      'Fix the #1 pattern before applying to 50 more roles.',
      'Re-run **JD Match** on your next target role.',
    ],
    who: 'Candidates with 20+ applications and fewer than 3 interview calls.',
    free: 'Pro plan feature.',
    related: ['no-interview-calls-after-50-applications', 'why-resume-not-getting-shortlisted', 'jd-match-ats-score-tool'],
  },
  {
    slug: 'job-scam-detector-india',
    toolSlug: 'scam-detector',
    title: 'Job Scam Detector India: Spot Fake Jobs on WhatsApp and Naukri',
    description:
      'AI job scam detector for India — fake recruiter messages, registration fee traps, Telegram job scams, and too-good salary offers.',
    keywords: 'job scam detector, fake job offer india, whatsapp job scam, naukri fake jobs',
    h1: 'Job Scam Detector',
    path: '/dashboard/tools/scam-detector',
    icon: '🚨',
    intro:
      '₹45,000/month work-from-home data entry. Pay ₹999 registration. Interview only on Telegram. If it sounds too good, it probably is a **job scam** — and India saw a surge in fake recruiter fraud in 2024–2026. **Job Scam Detector** analyses suspicious messages and job posts before you share Aadhaar or pay anyone.',
    what: 'Paste the job posting, WhatsApp message, or email. AI flags scam signals: upfront fees, vague company, unrealistic salary, Telegram-only contact, malware links, and known fraud patterns. Risk score + what to do next.',
    steps: [
      'Never pay registration or "laptop deposit" fees.',
      'Verify company on MCA portal and LinkedIn employee count.',
      'Report to cybercrime.gov.in if you already paid.',
    ],
    who: 'Freshers, work-from-home seekers, and anyone contacted by unknown "HR" on WhatsApp.',
    free: 'Unlimited on free plan.',
    related: ['how-to-find-a-job-india', 'remote-jobs-india-guide', 'freelance-jobs-beginners-india'],
  },
  {
    slug: 'voice-mock-interview-tool',
    toolSlug: 'voice-interview',
    title: 'Voice Mock Interview: Speak Your Answers, Get AI Feedback',
    description:
      'Voice-based mock interview — talk through answers aloud, AI listens and probes like a real interviewer. Best for spoken fluency.',
    keywords: 'voice mock interview, speak interview practice, ai voice interview, oral interview prep',
    h1: 'Voice Interview',
    path: '/dashboard/tools/voice-interview',
    icon: '🎙️',
    intro:
      'Typing answers is easy. Saying them aloud while a stranger watches is not. **Voice Interview** runs a spoken mock round — ElevenLabs reads questions in a natural voice, you talk back via mic or keyboard, and AI probes with follow-ups like a real interviewer.',
    what: 'Choose role and interview style. The interviewer speaks through high-quality AI voice (male/female options). Use the microphone to answer — your speech is transcribed and sent automatically after a brief pause — or type if you prefer. AI evaluates clarity, structure, and content between questions.',
    steps: [
      'Use headphones in a quiet room and allow mic access.',
      'Pick an interviewer voice and listen to the demo greeting.',
      'Answer in full sentences — mic auto-sends when you pause.',
      'Pair with **Interview Prep** and **Mock Interview** for full practice.',
    ],
    who: 'Candidates weak in spoken English or who panic on phone interviews.',
    free: 'Pro plan feature.',
    related: ['ai-mock-interview-tool', 'ai-interview-prep-questions', 'job-interview-preparation'],
  },
  {
    slug: 'interview-debrief-tool',
    toolSlug: 'debrief',
    title: 'Interview Debrief: Learn From Every Round You Completed',
    description:
      'Post-interview debrief AI — paste what you remember, get analysis of what went well, red flags, and prep for the next round.',
    keywords: 'interview debrief, post interview analysis, interview reflection, interview feedback ai',
    h1: 'Interview Debrief',
    path: '/dashboard/tools/debrief',
    icon: '🎭',
    intro:
      'You walk out of an interview unsure if you nailed it or bombed it. **Interview Debrief** turns your raw notes into structured feedback: strong moments, weak answers, likely interviewer concerns, and prep for round 2.',
    what: 'Enter role, company, questions you remember, and your answers. AI assesses answer quality, flags vague responses, suggests better phrasing, and predicts whether you are likely to advance.',
    steps: [
      'Write notes within 30 minutes of the interview.',
      'Include questions you struggled on.',
      'Use output to prep for **Mock Interview** before round 2.',
    ],
    who: 'Multi-round interview processes — product, consulting, and senior tech roles.',
    free: 'Unlimited on free plan.',
    related: ['thank-you-email-after-interview', 'ai-interview-prep-questions', 'company-research-interview-tool'],
  },
  {
    slug: 'company-research-interview-tool',
    toolSlug: 'company-research',
    title: 'Company Research for Interviews: 5-Minute Brief Before You Walk In',
    description:
      'AI company research brief — overview, recent news, culture signals, smart questions to ask, and red flags. Tailored to your role.',
    keywords: 'company research interview, interview prep company, questions to ask interviewer, company brief interview',
    h1: 'Company Research',
    path: '/dashboard/tools/company-research',
    icon: '🔍',
    intro:
      '"What do you know about our company?" eliminates candidates who did not prepare. **Company Research** builds a 5-minute brief: what they do, recent moves, culture clues from public info, and **5 smart questions** to ask your interviewer.',
    what: 'Enter company name, role, and interview date. AI outputs: company overview, product/market context, culture signals, talking points to impress, questions to ask, and red flags to probe in interview.',
    steps: [
      'Read brief night before — not in the lobby.',
      'Pick 2 questions to ask — not all 5.',
      'Cross-check recent news on Google for accuracy.',
    ],
    who: 'Final-round and HR interviews where culture fit matters.',
    free: 'Pro plan feature.',
    related: ['interview-debrief-tool', 'ai-interview-prep-questions', 'job-interview-preparation'],
  },
  {
    slug: 'job-offer-comparator-tool',
    toolSlug: 'offer-compare',
    title: 'Job Offer Comparator: Compare CTC, Growth, and Culture Side by Side',
    description:
      'Compare 2–3 job offers with AI — salary, growth, red flags, and negotiation script for your preferred offer.',
    keywords: 'compare job offers, job offer comparison, multiple offers which to choose, ctc comparison',
    h1: 'Offer Comparator',
    path: '/dashboard/tools/offer-compare',
    icon: '⚖️',
    intro:
      'Two offers. One pays ₹2 LPA more. The other has better learning and brand. Spreadsheets do not capture **growth potential** or **culture red flags**. **Offer Comparator** breaks down 2–3 offers and recommends which to take — with negotiation script for the winner.',
    what: 'Paste offer details (CTC breakdown, role, company, location, perks). AI compares on: compensation, growth trajectory, culture signals from JD language, red flags, and overall fit. Includes script to leverage competing offer.',
    steps: [
      'Include ESOPs, bonus, and WFH policy — not just base.',
      'Discuss with someone who worked at each company if possible.',
      'Use **Salary Script** to negotiate after choosing preferred offer.',
    ],
    who: 'Candidates with 2+ active offers in the same week — common in campus and hot tech markets.',
    free: 'Pro plan feature.',
    related: ['salary-negotiation-script-ai', 'first-90-days-plan-tool', 'remote-jobs-india-guide'],
  },
  {
    slug: 'first-90-days-plan-tool',
    toolSlug: 'ninety-days',
    title: 'First 90 Days Plan: Hit the Ground Running in a New Job',
    description:
      'AI 30-60-90 day plan for new joiners — week-by-week actions, quick wins, and who to meet. Built from your CV and new role.',
    keywords: '30 60 90 day plan, first 90 days new job, onboarding plan, new job action plan',
    h1: 'First 90 Days',
    path: '/dashboard/tools/ninety-days',
    icon: '🚀',
    intro:
      'Starting a new job without a plan means reactive firefighting for three months. A **30-60-90 day plan** shows your manager you are strategic — and helps you earn trust fast. **First 90 Days** generates a role-specific plan from your CV and new job details.',
    what: 'Enter CV, new title, company, and team context. AI outputs week-by-week plan: people to meet, skills to learn, quick wins for days 1–30, ownership targets for 60–90, and metrics to track.',
    steps: [
      'Share draft with manager in week 1 — align expectations.',
      'Adjust plan after understanding real team priorities.',
      'Review at day 30 and day 60.',
    ],
    who: 'New joiners, especially lateral hires and first-time managers.',
    free: 'Pro plan feature.',
    related: ['job-offer-comparator-tool', 'ai-career-path-planner', 'salary-negotiation-script-ai'],
  },
  {
    slug: 'resignation-letter-generator',
    toolSlug: 'resignation',
    title: 'Resignation Letter Generator: Professional Exit in 5 Minutes',
    description:
      'AI resignation letter — polite, professional, correct notice period format for Indian companies. PDF-ready text.',
    keywords: 'resignation letter generator, resignation letter format india, how to write resignation, notice period letter',
    h1: 'Resignation Letter',
    path: '/dashboard/tools/resignation',
    icon: '✍️',
    intro:
      'Resigning badly burns bridges. Resigning well keeps references and LinkedIn goodwill. **Resignation Letter** generates a professional letter with correct notice period, gratitude, and handover offer — tailored to Indian corporate norms.',
    what: 'Enter name, role, company, last working day, and notice period. AI writes formal resignation letter and optional shorter email version for HR.',
    steps: [
      'Tell your manager verbally before sending letter.',
      'Send letter to HR and manager same day.',
      'Do not vent — keep it neutral even if you hated the job.',
    ],
    who: 'Anyone resigning with standard 30–90 day notice in India.',
    free: 'Unlimited on free plan.',
    related: ['job-offer-comparator-tool', 'salary-negotiation-script-ai', 'how-to-find-a-job-india'],
  },
  {
    slug: 'freelancer-profile-builder-tool',
    toolSlug: 'freelancer-profile',
    title: 'Freelancer Profile Builder: Upwork, Fiverr, and LinkedIn Bio',
    description:
      'Build freelancer profile text from your CV — bio, service descriptions, and portfolio bullets for Upwork, Fiverr, and direct clients.',
    keywords: 'freelancer profile, upwork profile bio, fiverr description, freelance portfolio india',
    h1: 'Freelancer Profile',
    path: '/dashboard/tools/freelancer-profile',
    icon: '💼',
    intro:
      'Your resume is for jobs. Freelance platforms need a **different pitch** — outcome-focused bio, service packages, and keywords clients search. **Freelancer Profile** converts your CV into platform-ready copy for Upwork, Fiverr, and LinkedIn Services.',
    what: 'Paste CV and select platform + service niche. AI writes: headline, bio, 3 service descriptions, portfolio bullet summaries, and suggested hourly rate range for Indian market context.',
    steps: [
      'Add 2–3 real sample projects as portfolio pieces.',
      'Start with lower rate for first 5 reviews — raise after.',
      'See [freelance jobs guide](/blog/freelance-jobs-beginners-india).',
    ],
    who: 'Side hustlers, developers, designers, and writers starting freelance in India.',
    free: '2 free generations per day.',
    related: ['freelance-jobs-beginners-india', 'resume-bullet-rewriter-ai', 'ai-linkedin-about-writer'],
  },
]

function buildPost(tool, index) {
  const date = new Date('2026-06-01')
  date.setDate(date.getDate() + index)
  const dateStr = date.toISOString().slice(0, 10)

  const relatedBlock = tool.related
    .map((s) => `- [Related guide](/blog/${s})`)
    .join('\n')

  const stepsBlock = tool.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')

  const faq = [
    {
      q: `Is the ${tool.h1} tool free?`,
      a: tool.free,
    },
    {
      q: `Who should use ${tool.h1}?`,
      a: tool.who,
    },
    {
      q: 'Do I need to upload my full CV?',
      a: 'Yes — paste or upload CV text so AI can tailor output to your actual experience. MyCVRoast does not sell your data; processing is for your session output.',
    },
  ]

  return `---
title: "${tool.title.replace(/"/g, '\\"')}"
slug: "${tool.slug}"
date: "${dateStr}"
description: "${tool.description.replace(/"/g, '\\"')}"
keywords: "${tool.keywords}"
faq:
  - q: "${faq[0].q.replace(/"/g, '\\"')}"
    a: "${faq[0].a.replace(/"/g, '\\"')}"
  - q: "${faq[1].q.replace(/"/g, '\\"')}"
    a: "${faq[1].a.replace(/"/g, '\\"')}"
  - q: "${faq[2].q.replace(/"/g, '\\"')}"
    a: "${faq[2].a.replace(/"/g, '\\"')}"
---

${tool.intro}

This guide explains how the MyCVRoast **${tool.h1}** ${tool.icon} tool works, who it is for, and how to get the best results in India's 2026 job market.

## What Is ${tool.h1}?

${tool.what}

Access it from your dashboard: [${tool.h1} →](https://www.mycvroast.in${tool.path})

${tool.who}

## How to Use ${tool.h1}

${stepsBlock}

## Free vs Pro Access

${tool.free} Pro users get unlimited access to all dashboard AI tools including ${tool.h1}. See [pricing plans](/plans) for details.

## Tips for Better Results

- **Use fresh CV text** — run a [free resume roast](/) first to fix obvious issues.
- **Be specific** — role titles, company names, and dates improve output quality.
- **Edit the AI draft** — treat output as a strong first draft, not final copy.
- **Combine tools** — pair ${tool.h1} with other MyCVRoast tools in your workflow.

## Related Guides

${relatedBlock}

## Start Using ${tool.h1} Today

**Ready to try it?**

1. [Open ${tool.h1} →](https://www.mycvroast.in${tool.path}) — ${tool.free.includes('Pro') ? 'Pro plan required' : 'free with your account'}
2. [Create a free account →](/login) if you are new
3. [See all 29+ tools →](/blog/mycvroast-ai-tools-guide) · [Compare plans →](/plans)

New here? Start with a [free resume roast](/) — then every dashboard tool uses your CV for better output.
`
}

if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true })

let written = 0
for (let i = 0; i < TOOLS.length; i++) {
  const tool = TOOLS[i]
  const filePath = path.join(BLOG_DIR, `${tool.slug}.md`)
  fs.writeFileSync(filePath, buildPost(tool, i), 'utf-8')
  written++
  console.log(`✓ ${tool.slug}.md`)
}

console.log(`\nGenerated ${written} tool blog posts in content/blog/`)
