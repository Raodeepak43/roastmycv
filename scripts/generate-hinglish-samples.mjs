#!/usr/bin/env node
/** Generates 5 P0 Hinglish sample blog posts. Run: node scripts/generate-hinglish-samples.mjs */
import fs from 'fs'
import path from 'path'

const BLOG = path.join(process.cwd(), 'content/blog')

const POSTS = [
  {
    slug: 'cv-kaise-banaye',
    title: 'CV Kaise Banaye — Fresher Guide 2026 (Step-by-Step Hinglish)',
    keyword: 'cv kaise banaye',
    description:
      'CV kaise banaye — complete Hinglish guide for Indian freshers. Format, sections, ATS tips, common galtiyan, aur free AI roast se check kaise karein.',
    faq: [
      { q: 'CV aur resume me kya difference hai?', a: 'India me dono aksar same cheez hain — 1-2 page professional document. CV kabhi-kabhi academic ya detailed hota hai; job apply ke liye resume/CV dono chalte hain.' },
      { q: 'Fresher ka CV kitne page ka hona chahiye?', a: 'Ek page best hai 0-2 saal experience ke liye. Do page tab jab projects/internships zyada hon aur sab relevant ho.' },
      { q: 'CV banane ke baad check kaise karein?', a: 'MyCVRoast par free upload karo — 30 second me score, roast lines, aur fix list milti hai. Signup optional.' },
    ],
    body: buildCvKaiseBanaye,
  },
  {
    slug: 'achha-resume-kaise-banaye',
    title: 'Achha Resume Kaise Banaye — Indian Fresher ke Liye Poora Guide',
    keyword: 'achha resume kaise banaye',
    description:
      'Achha resume kaise banaye — section-by-section Hinglish guide. Summary, skills, projects, CGPA, ATS format, aur free AI review tips for campus & off-campus.',
    faq: [
      { q: 'Achha resume ka matlab kya hai?', a: 'Recruiter 10 second me samajh jaye aap kaun ho, kya stack aata hai, aur kyun interview pe bulaye — bina photo clutter ya generic "team player" ke.' },
      { q: 'Template se achha resume ban sakta hai?', a: 'Template start point hai — content aapka hona chahiye. Canva image CV ATS fail karta hai; simple one-column PDF best.' },
      { q: 'Hinglish me feedback milega?', a: 'Haan — MyCVRoast par Hinglish roast mode hai jo desi tone me honestly batata hai kya weak hai.' },
    ],
    body: buildAchhaResume,
  },
  {
    slug: 'bina-experience-ke-resume-kaise-banaye',
    title: 'Bina Experience ke Resume Kaise Banaye — Zero Job History Guide',
    keyword: 'bina experience ke resume kaise banaye',
    description:
      'Bina experience ke resume kaise banaye — projects, internships, college work, skills section tips for Indian freshers. ATS-friendly format + free checker.',
    faq: [
      { q: 'Experience zero ho to resume reject ho jata hai?', a: 'Nahi — freshers ke liye projects, internships, hackathons, aur college roles experience ki jagah le sakte hain agar bullets strong hon.' },
      { q: 'Fake experience likh sakte hain?', a: 'Bilkul nahi — background check aur interview me pakde jaoge. Real projects aur coursework highlight karo.' },
      { q: 'Kitne projects likhein?', a: '2-3 strong projects jo aap confidently explain kar sako — tech stack, aapka role, aur outcome ke saath.' },
    ],
    body: buildBinaExperience,
  },
  {
    slug: 'chatgpt-se-resume-kaise-banaye',
    title: 'ChatGPT se Resume Kaise Banaye — AI Use Karo, Galtiyan Mat Karo',
    keyword: 'chatgpt se resume kaise banaye',
    description:
      'ChatGPT se resume kaise banaye — prompts, sections, fact-checking, aur kahan AI fail hota hai. Indian fresher ke liye safe workflow + free roast check.',
    faq: [
      { q: 'Kya poora resume ChatGPT se likh sakte hain?', a: 'Draft ho sakta hai — lekin facts, dates, company names, aur metrics aapko verify karne padenge. AI kabhi fake numbers bana deta hai.' },
      { q: 'ChatGPT resume ATS friendly deta hai?', a: 'Kabhi-kabhi — lekin aapko one-column plain format enforce karna padta hai. Upload ke baad checker se verify karo.' },
      { q: 'MyCVRoast aur ChatGPT me kya fark hai?', a: 'ChatGPT generic likhta hai; MyCVRoast aapka upload padh ke roast karta hai — weak bullets quote karke batata hai.' },
    ],
    body: buildChatgptResume,
  },
  {
    slug: '12th-pass-resume-kaise-banaye',
    title: '12th Pass Resume Kaise Banaye — Job & Internship ke Liye Format',
    keyword: '12th pass resume kaise banaye',
    description:
      '12th pass resume kaise banaye — education-first format, skills, part-time work, BPO/retail/ apprenticeship applications. Free AI check for India.',
    faq: [
      { q: '12th pass ko resume chahiye ya biodata?', a: 'Private companies aur BPOs usually resume prefer karte hain — simple one page English/Hinglish mix chalega.' },
      { q: 'Graduation nahi hai to skills kya likhein?', a: 'MS Office, typing speed, basic English, customer handling, cash billing, computer course — jo sach ho.' },
      { q: 'Photo lagani chahiye?', a: 'Retail/BPO me kabhi maangte hain — IT/MNC me avoid karo unless JD me likha ho.' },
    ],
    body: build12thPass,
  },
]

function section(title, paras) {
  return `\n## ${title}\n\n${paras.join('\n\n')}\n`
}

function padTo1200(base, extras) {
  return base + extras.join('')
}

const EXTRA = {
  campus: section('Campus placement context (India 2026)', [
    'TPO deadline pe sab last minute CV banate hain — isliye templates copy-paste zyada dikhte hain. Jo student pehle se iterate karta hai uska shortlist rate alag hota hai.',
    'Service companies mass hire karti hain — CGPA cutoff + basic aptitude + **readable CV**. Product/startup me projects zyada matter karte hain.',
    'Off-campus me LinkedIn + Naukri + company site — har channel pe same PDF theek hai lekin cover email ya form answers customize karo.',
    'Group discussion aur interview se pehle CV questions aate hain: "Yeh project tumne akela kiya?" — jo CV pe likha hai woh defend karna aana chahiye.',
  ]),
  ats: section('ATS samajhna zaroori kyun hai', [
    'ATS ek filter hai jo 1000 resumes me se 50 ko human tak pahunchata hai. Keywords, headings, parse-able PDF matter karte hain.',
    'Heading galat ho to experience parse nahi hota — "My Journey" ki jagah "Experience" ya "Projects" use karo.',
    'Tables, text boxes, headers/footers me contact info mat chhupao — parser miss kar sakta hai.',
    'Roast tool se pehle [ATS score checker](/ats-score-checker) try karo agar formatting doubt ho.',
  ]),
  mistakes: section('Aur galtiyan jo freshers repeat karte hain', [
    'LinkedIn URL galat ya outdated — recruiter check karta hai.',
    'Skills me "AI, ML, Blockchain" sab kuch jab sirf basic Python aata ho — interview me expose ho jata hai.',
    'Poora address + father name + religion — private sector me clutter unless specifically asked.',
    'PDF scan photo of paper CV — OCR fail, ATS zero.',
    'Email subject "Resume" bhejna jab JD me specific format maanga ho.',
  ]),
  tools: section('MyCVRoast tools jo CV ke baad help karte hain', [
    '[Resume builder](/resume-builder) — guided one-column draft with live score.',
    '[LinkedIn roast](/linkedin-roast) — CV fix ke baad profile bhi align karo.',
    '[Interview prep](/login?next=/dashboard/tools/interview-prep) — CV bullets se hi questions aate hain.',
    'Pro ₹149 one-time — unlimited roasts + mock interview (campus ke baad useful).',
  ]),
  longform: section('Real talk — recruiter kya sochta hai (anonymous HR POV)', [
    'Pehli nazar me hum scan karte hain: job title match, college tier sometimes, project keywords, red flags (gaps unexplained, all caps, weird email).',
    'Agar ek hi project teen baar alag sections me repeat ho to lagta hai padding kar rahe ho. Quality > quantity.',
    'Hinglish me baat karte hain team me — lekin CV English me clean hona chahiye unless role specifically local language maange.',
    'Shortlist ke baad hi roast wali galtiyan pakdi jaati hain interview me — isliye pehle se fix karna cheap hai.',
    'Last tip: apply date track karo. Same company ko revised CV 3 din baad bhejna allowed hai agar genuinely improve kiya ho.',
  ]),
}

function buildCvKaiseBanaye() {
  return (
    `**CV kaise banaye** — yeh sawal har fresher Google pe type karta hai jab pehli baar campus ya Naukri pe apply karta hai. Problem yeh nahi ki template nahi milta; problem yeh hai ki template bharne ke baad bhi callback nahi aata. Is guide me step-by-step samjhenge Indian job market ke liye CV ka structure, common galtiyan, aur free me check kaise karein.

**[Free CV roast karo →](/)**

` +
    section('CV banane se pehle — goal clear karo', [
      'Pehle decide karo: campus placement, off-campus IT, government form, ya BPO/retail. Har goal ka CV thoda alag hota hai — same file sab jagah mat bhejo bina edit kiye.',
      'Ek company ka job description (JD) kholo aur highlight karo repeated words — wahi ATS keywords hain. CV un words ko naturally project aur skills me use karega to shortlist chance badhta hai.',
      'Agar aapke paas sirf college projects hain, tension mat lo — freshers ke liye projects hi experience ka proof hain jab internship nahi hai.',
    ]) +
    section('Step 1: Contact details (simple rakho)', [
      'Top pe naam, phone, professional email (gmail with name — silly IDs mat use karo), LinkedIn URL optional, city. Address poora likhne ki zarurat nahi unless form maange.',
      'Photo: IT service companies aur remote roles me usually skip karo. Local retail ho to company culture dekh ke decide karo.',
    ]) +
    section('Step 2: Summary / Objective — 2 line max', [
      'Purana template: "Seeking challenging opportunities in a dynamic organization…" — yeh line recruiter ki nazar me instant delete trigger hai.',
      'Better Hinglish style: "B.Tech CSE 2026 | Python, SQL, React | Ek inventory web app banaya jo college lab me use hota hai — SDE internship dhundh raha hoon."',
      'Numbers aur tools ka naam likho — vague adjectives nahi.',
    ]) +
    section('Step 3: Education — India format', [
      'Degree, college, university, year, CGPA (agar achha hai ya company puchti hai). 10th/12th percentage kabhi add karo jab fresher ho aur space bache — warna sirf degree section kaafi.',
      'CGPA hide mat karo agar 7+ hai — warna recruiter assume karega worst case. Agar low hai to projects aur skills ko strong banao.',
    ]) +
    section('Step 4: Projects — asli hero section', [
      'Har project bullet: **Problem → Aapne kya kiya → Tech stack → Result**. Example: "College fest registration manual tha — Python + SQLite se CLI tool banaya; registration time 2 ghante se 20 minute."',
      'GitHub link do jahan possible. Live demo ho to aur achha. Sirf "minor project" likh ke chhodna waste hai.',
    ]) +
    section('Step 5: Skills — split karo', [
      'Teen buckets: Languages/Tools, Frameworks/Databases, Soft (communication, documentation). "MS Office, hard working" akela mat chhodo — har fresher likhta hai.',
      'JD se match karo: JD me "Java" hai to Java project me bhi dikhe aur skills me bhi — naturally, fake mat karo.',
    ]) +
    section('Step 6: Internships & activities', [
      'Internship ho to company name, duration, 2-3 bullets with outcomes. Nahi ho to college fest lead, NSS, coding club, hackathon — leadership dikhao jahan sach ho.',
      'Certificates sirf tab jab relevant hon (AWS, NPTEL core subject) — 10 random Udemy certificates clutter karte hain.',
    ]) +
    section('Format & ATS — PDF kaise export karein', [
      'One column, black text, standard fonts (Arial/Calibri). Canva poster-style CV PDF image ban jata hai — ATS read nahi kar pata.',
      'Word/Google Docs se **Save as PDF** karo. Phir [free ATS score checker](/ats-score-checker) ya homepage roast se verify karo.',
    ]) +
    section('Common galtiyan jo CV reject karwati hain', [
      '1. Same CV 100 companies ko bina JD keywords ke\n2. Two-page fresher CV with school hobby essay\n3. Skills section me 30 buzzwords, projects me kuch proof nahi\n4. Typos — "Curriculam Vitae" header pe\n5. Email typo — callback kabhi nahi aayega',
    ]) +
    section('CV banne ke baad — free check zaroori kyun hai', [
      'Dost "theek lag raha hai" bolega — recruiter nahi. **MyCVRoast** par upload karo: 30 second me score, Hinglish roast, aur fix list. Do baar chalao — pehle draft, fixes ke baad final.',
      'Aur deep tailoring ke liye dashboard me [JD Match](/login?next=/dashboard/tools/jd-match) use karo jab dream company ka posting mile.',
    ]) +
    `\n## Abhi karo\n\n1. Google Doc me one-page draft banao\n2. PDF export\n3. [Free roast →](/)\n4. Top 3 fixes apply\n5. Phir apply karo\n\nRelated: [Achha resume kaise banaye](/blog/achha-resume-kaise-banaye) · [Bina experience resume](/blog/bina-experience-ke-resume-kaise-banaye)\n` +
    EXTRA.campus +
    EXTRA.ats +
    EXTRA.mistakes +
    EXTRA.tools +
    EXTRA.longform
  )
}

function buildAchhaResume() {
  return (
    `**Achha resume kaise banaye** — sabko lagta hai unka CV "theek" hai jab tak 50 applications ke baad koi call nahi aata. Achha resume woh hai jo recruiter ko 6-10 second me bataye: kaun ho, kya kar sakte ho, proof kya hai. Yeh guide Indian fresher tone me poora flow deti hai.

**[Apna resume roast karo free →](/)**

` +
    section('Achha resume ki pehchan kya hai?', [
      'Achha ≠ sirf "sundar design". Achha = **readable + relevant + honest proof**. TCS, startup, ya agency — sab ATS ya HR screen se guzarte hain.',
      'Recruiter sochta hai: "Is bande ko interview pe bulaya to project explain kar payega?" Agar bullets vague hain to reject.',
    ]) +
    section('Section-by-section blueprint', [
      '**Header:** Naam + phone + email + LinkedIn (optional). City likho — relocation clear ho.',
      '**Summary:** 2 lines — degree, stack, ek proof line. Fresher ho to "X seek karta hoon" clearly likho.',
      '**Education:** Degree, college, CGPA policy company ke hisaab se. Campus me cutoff matter karta hai.',
      '**Experience/Internship:** Action verbs: Built, Led, Reduced, Automated. Numbers jahan sach hon.',
      '**Projects:** Minimum 2 detailed. GitHub links. Team project me **apna** role clear likho.',
      '**Skills:** JD-aligned. Fake advanced skills mat daalo — interview me pakde jaoge.',
    ]) +
    section('Hinglish tone vs formal English', [
      'Resume document usually English me hota hai — lekin **feedback** Hinglish me lena easier hai kyunki samajh aata hai kya cringe hai. MyCVRoast me Hinglish roast mode isliye popular hai campus me.',
      'Resume ke andar "I am passionate team player" English cliche hai — replace with specifics.',
    ]) +
    section('ATS achha resume ko kaise padhta hai', [
      'ATS text parse karta hai — columns, text boxes, icons often fail. Simple layout = higher parse score.',
      'Keywords JD se match hone chahiye — "business analyst" role me SQL + Excel + JIRA dikhe projects me.',
      '[ATS resume checker free](/ats-resume-checker-free) se pehle structure verify karo.',
    ]) +
    section('Achha resume ke 7 rules (2026 India)', [
      '1. Ek page fresher default\n2. Har bullet me verb + scope + outcome\n3. No photo for IT unless asked\n4. CGPA policy socho — hide only if truly hurting\n5. Customise keywords per apply batch\n6. PDF text-selectable ho\n7. Roast se pehle apply mat karo blindly',
    ]) +
    section('Before vs after example (concept)', [
      '**Weak:** "Worked on web development project using various technologies."\n**Strong:** "Built MERN attendance portal for 120-student dept; cut manual entry ~4 hrs/week; deployed on college LAN."',
      'Yahi transformation achha resume define karta hai — AI roast aapko exactly aisi lines pakad ke deta hai.',
    ]) +
    section('Tools jo achha resume banane me help karte hain', [
      '[Resume builder](/resume-builder) — live ATS score ke saath draft\n[Free roast](/) — honest bullet feedback\n[JD Match](/login?next=/dashboard/tools/jd-match) — company-specific keywords\n[Cover letter tool](/login?next=/dashboard/tools/cover-letter) — jahan letter maanga ho',
    ]) +
    `\n## Final checklist\n\n- [ ] Summary me role + stack clear\n- [ ] 2+ projects with metrics\n- [ ] Skills match target JD\n- [ ] One-page PDF\n- [ ] Free roast score 7+\n\n[Roast Karo →](/)\n` +
    EXTRA.campus +
    EXTRA.ats +
    section('Campus vs off-campus resume difference', [
      'Campus me CGPA line prominent ho sakti hai — company ne cutoff diya hota hai. Off-campus startup apply me projects aur GitHub upar le jao.',
      'Mass recruiter 30 second me scan karta hai — bold headings, consistent dates, no graphics.',
    ]) +
    EXTRA.tools +
    EXTRA.longform +
    section('Bonus: 7-day CV improvement challenge', [
      '**Day 1:** Raw draft likho — template mat dekho.\n**Day 2:** Projects section polish — GitHub links.\n**Day 3:** Skills JD se match karo.\n**Day 4:** Pehla [free roast](/) — top 3 fixes note karo.\n**Day 5:** Fixes apply — dubara roast.\n**Day 6:** LinkedIn profile align karo.\n**Day 7:** 10 targeted applications — tracker me log karo.',
      'Yeh challenge har guide me same hai kyunki kaam karta hai — motivation WhatsApp forward se nahi, callback se aati hai.',
    ])
  )
}

function buildBinaExperience() {
  return (
    `**Bina experience ke resume kaise banaye** — sabse bada myth: "bina job experience ke CV blank hota hai." Sach yeh hai ki **har fresher** yahi stage se start karta hai. Recruiters India me internship aur projects se potential judge karte hain jab full-time history nahi hoti.

**[Zero experience CV check →](/cv-checker-for-freshers)**

` +
    section('Experience ki jagah kya likhein?', [
      '**College projects** — mini products, final year, hackathons\n**Internships** — chhoti ho to bhi count (virtual bhi)\n**Freelance** — Fiverr/local client agar real ho\n**College roles** — fest lead, society tech head\n**Open source** — genuine commits dikhao',
      'Ghar pe tutorial follow karke banaya app bhi project hai agar deploy/link ho aur aap explain kar sako.',
    ]) +
    section('Resume structure jab job history empty ho', [
      'Order tip: Summary → Projects → Skills → Education → Certifications (selective) → Activities.',
      'Projects upar rakho taaki ATS aur HR ko pehle proof mile. Education neeche bhi chalega campus drives me.',
    ]) +
    section('Projects ko "experience jaisa" kaise likhein', [
      'Company name mat banao fake. Title: "Personal Project" ya "Academic Project — DBMS Course" honest hai.',
      'Bullets STAR method: Situation, Task, Action, Result — chhota paragraph nahi, 1-2 line bullets.',
    ]) +
    section('Skills section — proof ke saath', [
      'Sirf "Python" mat likho — project me kaise use hua woh bullet me dikhe. Skills list duplicate keyword ke liye hai ATS ke liye.',
      'Soft skills generic list mat banao — communication tab likho jab presentation, fest anchoring, ya client call ka proof ho.',
    ]) +
    section('Gap year / career break freshers', [
      'Gap ho to chhupa ke mat rakho agar form pooche — [Gap Explainer tool](/login?next=/dashboard/tools/gap-explainer) se professional line banao.',
      'Gap me kya seekha — course, certification, family reason — honestly one line.',
    ]) +
    section('Kahan apply karein bina experience', [
      'Campus pools, internship portals, startup early careers, service company graduate programs. Volume high hoga — tracker use karo dashboard me.',
      'Har 50 rejects ke baad CV iterate karo — [rejection analyser](/login?next=/dashboard/tools/rejection-analyser) pattern dikhata hai.',
    ]) +
    section('Mistakes zero-experience freshers make', [
      'Fake internship at uncle company\nCopy-paste friend CV with wrong name\n10 pages of school medals\nOnly coursework listed with zero outcomes\nNo GitHub when applying for developer roles',
    ]) +
    `\n## Action plan\n\n1. 2 projects polish karo with README\n2. One-page CV likho\n3. [Fresher CV checker](/cv-checker-for-freshers)\n4. 10 targeted applies — same CV nahi\n5. Interview prep jab call aaye\n\n[Free roast →](/)\n` +
    EXTRA.campus +
    section('Internship nahi mila to kya karein', [
      'Virtual internship, open source, college lab assistant, freelance small website — kuch na kuch **proof** banao 3 mahine me.',
      'Coursera certificate se zyada ek deployable project matter karta hai developer roles me.',
      'Non-tech roles me customer facing part-time bhi experience section me ja sakta hai honestly.',
    ]) +
    EXTRA.ats +
    EXTRA.mistakes +
    EXTRA.tools +
    EXTRA.longform +
    section('Bonus: 7-day zero-experience job hunt', [
      'Week 1 focus: proof banao, apply mat karo blindly. Ek GitHub repo polish karo, README me screenshots dalo, LinkedIn update karo.',
      'Week 2: 15 companies shortlist — same role family. Har apply se pehle 3 JD keywords CV me add karo. Tracker me status likho.',
    ])
  )
}

function buildChatgptResume() {
  return (
    `**ChatGPT se resume kaise banaye** — AI se draft lena smart hai, blind copy-paste dumb hai. Bahut freshers prompt maarte hain, jo output aata hai use bina edit Naukri pe daal dete hain — phir "AI ne resume banaya phir bhi reject" meme ban jata hai. Sahi workflow yeh hai:

**[AI se banaya? Pehle roast karwao →](/)**

` +
    section('ChatGPT se resume banane ka safe workflow', [
      '**Step 1:** Khud apna raw data likho — college, projects, dates, tools, CGPA.\n**Step 2:** ChatGPT ko bolo one-page ATS format me bullets banao — **facts change mat karna**.\n**Step 3:** Output me hallucinations check karo (company names, fake metrics).\n**Step 4:** PDF banao.\n**Step 5:** MyCVRoast par upload — roast batayega kya weak hai.',
    ]) +
    section('Sample prompts jo kaam karte hain', [
      '```\nMain B.Tech CSE 2026 fresher hoon. Neeche mere projects hain. Inse one-page resume bullets banao — action verbs, no fake metrics, ATS friendly:\n[paste raw notes]\n```',
      '```\nIs resume bullet ko stronger banao, sirf mere diye facts use karo:\n"Worked on Java project"\n```',
      'Prompt me hamesha likho: **Do not invent employers, dates, or numbers.**',
    ]) +
    section('Kahan ChatGPT fail hota hai', [
      'Indian campus context (CGPA, TPO) weak samajhta hai\nKabhi US-style resume 2 page de deta hai\n"Passionate synergies" wali English bharta hai\nFake certifications suggest kar sakta hai\nMulti-column fancy layout recommend kar sakta hai',
    ]) +
    section('ChatGPT + MyCVRoast combo kyun best hai', [
      'ChatGPT **drafting** ke liye fast hai. MyCVRoast **your PDF** padh ke brutally specific feedback deta hai — "yeh bullet vague hai" quote karke.',
      'Pehle generic score nahi — roast lines jo behaviour change karein. Phir ChatGPT se sirf weak bullets rewrite karwao — loop 2-3 times.',
    ]) +
    section('Gemini / Claude — same rules', [
      'Koi bhi LLM — facts aapke, responsibility aapki. AI ne "led team of 10" likh diya jab aap solo the — yeh interview me fat jayega.',
    ]) +
    section('Free alternatives agar prompt nahi janna', [
      '[Resume builder](/resume-builder) guided sections\n[Bullet rewriter](/login?next=/dashboard/tools/cv-rewriter) dashboard tool\n[Homepage roast](/) direct upload',
    ]) +
    `\n## Quick dos & don'ts\n\n**Do:** Verify dates, use simple PDF, roast before mass apply\n**Don't:** Fake experience, trust AI metrics, use Canva image CV\n\n[Try free roast →](/) · [Resume roast vs review](/blog/resume-roast-vs-resume-review)\n` +
    section('ChatGPT vs MyCVRoast — kab kya use karein', [
      'Drafting bullets: ChatGPT fast hai jab aap facts do. Validation: MyCVRoast aapka PDF padhta hai.',
      'Loop: ChatGPT draft → PDF → Roast → weak lines wapas ChatGPT ko fix karwao with "no new facts" → dubara roast.',
      'Is loop se 2-3 iteration me CV dramatically improve hota hai bina plagiarism ke.',
    ]) +
    EXTRA.ats +
    EXTRA.mistakes +
    EXTRA.tools +
    EXTRA.longform +
    section('Bonus: ChatGPT prompt library (copy-paste)', [
      '**Rewrite bullet:** "Meri yeh bullet improve karo, naye facts mat banao: [paste]"\n**ATS check:** "Is CV me missing keywords for [role] JD: [paste JD excerpt]"\n**Summary:** "2-line fresher summary for [degree] targeting [role] India"',
      'Har output ke baad MyCVRoast par verify — LLM confident hota hai, galat bhi hota hai.',
    ])
  )
}

function build12thPass() {
  return (
    `**12th pass resume kaise banaye** — graduation nahi hai to bhi retail, BPO, data entry, field sales, aur apprenticeship me resume maanga jata hai. Format thoda alag hota hai: education upar, skills practical, language simple English/Hinglish mix chalega.

**[12th pass CV free check →](/cv-checker-for-freshers)**

` +
    section('12th pass resume ka basic format', [
      '**Naam + phone + city**\n**Objective:** Kaun si job — "Customer support executive role" clear likho vague "any job" nahi\n**Education:** 12th board, year, percentage\n**Skills:** Typing WPM, MS Office, basic English/Hindi, cash handling, etc.\n**Work experience:** Part-time, family shop, internship — jo bhi ho honestly\n**References:** Optional — "available on request"',
    ]) +
    section('Objective lines jo kaam karti hain', [
      '"12th pass, fluent Hindi/English, 6 months retail billing experience — customer-facing role dhundh raha hoon."\nCompare with: "Hardworking boy want job urgently" — second wala reject.',
    ]) +
    section('Experience nahi hai to kya likhein', [
      'Family business help, tuition teaching, volunteer, NSS, computer course project — **hours + task** likho.',
      'Example: "Assisted father grocery shop — billing & stock counting, 1 year, evening hours."',
    ]) +
    section('Skills jo 12th pass roles me matter karti hain', [
      'MS Word/Excel basics\nTyping speed (honest WPM)\nCustomer communication\nLocal language + English\nTwo-wheeler license agar field job ho',
    ]) +
    section('Photo, marital status, religion', [
      'Kuch local employers photo maangte hain form me — resume me tabhi jab industry norm ho. IT MNC rules yahan apply nahi hote but still keep one page clean.',
    ]) +
    section('Kahan apply karein', [
      'Naukri "12th pass" filter, local consultancies, walk-in malls, BPO hiring drives, government apprenticeship portals — har jagah simple PDF bhejo.',
    ]) +
    section('Banane ke baad check kaise karein', [
      'Spelling errors fatal hain — especially phone number. MyCVRoast par upload karo ya dost se padhwa ke clarity check karo.',
      '[Free resume checker India](/free-resume-checker-india) page se bhi upload kar sakte ho.',
    ]) +
    `\n## Checklist\n\n- [ ] Phone/email double-check\n- [ ] Job title objective me clear\n- [ ] One page\n- [ ] Practical skills listed\n- [ ] Free AI roast once\n\n[Roast Karo →](/)\n` +
    section('Sample 12th pass objective aur skills (dekh ke adapt karo)', [
      'BPO: "12th (HBSE) 2024, 68% | Hindi/English fluent | Night shift OK | 35 WPM typing | Customer support role."\nRetail: "12th pass, 6 months billing counter, cash + Excel basic, immediate joiner."\nApprenticeship: "ITI electrician + 12th science — factory apprentice trainee."',
      'Jo sach nahi hai mat likho — training period me fire hone se bachna hai.',
    ]) +
    EXTRA.campus +
    EXTRA.mistakes +
    EXTRA.tools +
    EXTRA.longform +
    section('Bonus: walk-in interview ke liye CV print tips', [
      'Ek page, black & white print, 80gsm paper — fancy card stock ki zarurat nahi.',
      'Phone number pen se likh ke mat overwrite karo PDF pe; typo fatal hai.',
      'Walk-in pe same day updated CV le jao agar manager ne different role suggest kiya.',
    ])
  )
}

for (const post of POSTS) {
  const content = `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${post.slug}"
date: "2026-07-03"
type: guide
author: MyCVRoast Team
description: "${post.description.replace(/"/g, '\\"')}"
keywords: "${post.keyword}, resume guide hindi, fresher resume india, mycvroast"
faq:
${post.faq.map((f) => `  - q: "${f.q.replace(/"/g, '\\"')}"\n    a: "${f.a.replace(/"/g, '\\"')}"`).join('\n')}
---

${post.body()}
`
  fs.writeFileSync(path.join(BLOG, `${post.slug}.md`), content)
  const words = content.split(/\s+/).length
  console.log(`✓ ${post.slug}.md (${words} words)`)
}

console.log('\nDone — 5 Hinglish sample posts written.')
