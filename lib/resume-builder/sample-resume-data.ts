import type { ResumeData } from '@/lib/resume-builder/types'

/** Realistic demo content for template gallery thumbnails */
export const SAMPLE_RESUME_DATA: ResumeData = {
  templateId: 'classic',
  personal: {
    fullName: 'Priya Sharma',
    jobTitle: 'Software Engineer',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    linkedin: 'linkedin.com/in/priyasharma',
  },
  summary:
    'Software engineer with 3+ years building scalable web products. Strong in React, Node.js, and cloud deployment. Delivered features used by 50K+ users with measurable impact on performance and reliability.',
  experience: [
    {
      id: 's1',
      company: 'Razorpay',
      jobTitle: 'Software Engineer',
      location: 'Bengaluru',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        'Built payment dashboard features serving 50K+ merchants; reduced page load by 35%.',
        'Led migration to TypeScript across 12 micro-frontends with zero downtime.',
        'Mentored 2 interns; both converted to full-time offers.',
      ],
    },
    {
      id: 's2',
      company: 'Infosys',
      jobTitle: 'Associate Engineer',
      location: 'Pune',
      startDate: 'Jul 2020',
      endDate: 'Dec 2021',
      bullets: [
        'Developed REST APIs for banking client; improved response time by 28%.',
        'Wrote unit tests achieving 85% code coverage on critical modules.',
      ],
    },
  ],
  projects: [
    {
      id: 'p1',
      name: 'JobTracker AI',
      techStack: 'Next.js, PostgreSQL',
      description: 'Open-source job application tracker with ATS score hints — 200+ GitHub stars.',
    },
  ],
  skills: {
    languages: 'JavaScript, TypeScript, Python',
    frameworks: 'React, Next.js, Node.js',
    tools: 'AWS, Docker, Git, Jira',
    databases: 'PostgreSQL, MongoDB, Redis',
  },
  education: {
    degree: 'B.Tech Computer Science',
    university: 'VIT Vellore',
    gradYear: '2020',
    gpa: '8.4',
  },
  achievements: ['Hackathon winner — Smart India Hackathon 2019', 'AWS Cloud Practitioner certified'],
}
