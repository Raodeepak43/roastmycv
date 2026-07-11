export type TargetRoleCategory = {
  id: string
  label: string
  hint: string
  roles: readonly string[]
}

/** Curated target roles for Indian job seekers — used in interview prep & mock interview. */
export const TARGET_ROLE_CATEGORIES: readonly TargetRoleCategory[] = [
  {
    id: 'tech',
    label: 'Tech & IT',
    hint: 'Software, data, QA, DevOps',
    roles: [
      'Software Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Data Analyst',
      'Data Scientist',
      'Business Analyst',
      'QA Engineer',
      'DevOps Engineer',
      'Cloud Engineer',
      'Android Developer',
      'iOS Developer',
      'AI / ML Engineer',
    ],
  },
  {
    id: 'product',
    label: 'Product & Design',
    hint: 'PM, UX, growth',
    roles: [
      'Product Manager',
      'Associate Product Manager',
      'Product Analyst',
      'UX Designer',
      'UI Designer',
      'Graphic Designer',
      'Content Designer',
      'Growth Manager',
    ],
  },
  {
    id: 'business',
    label: 'Business & Ops',
    hint: 'Sales, marketing, ops',
    roles: [
      'Marketing Executive',
      'Digital Marketing Specialist',
      'Sales Executive',
      'Business Development Executive',
      'Operations Executive',
      'HR Executive',
      'Recruiter',
      'Customer Success Manager',
      'Account Manager',
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Commerce',
    hint: 'Accounts, audit, banking',
    roles: [
      'Accountant',
      'Financial Analyst',
      'Chartered Accountant (Articleship)',
      'Investment Banking Analyst',
      'Credit Analyst',
      'Tax Associate',
      'Company Secretary Trainee',
    ],
  },
  {
    id: 'fresher',
    label: 'Fresher & Campus',
    hint: 'Internships, graduate roles',
    roles: [
      'Fresher — Software Engineer',
      'Fresher — Data Analyst',
      'Fresher — Business Analyst',
      'Management Trainee',
      'Graduate Engineer Trainee (GET)',
      'Summer Intern',
      'Campus Placement — IT',
      'Campus Placement — Non-Tech',
    ],
  },
  {
    id: 'other',
    label: 'Other popular',
    hint: 'Consulting, support, more',
    roles: [
      'Management Consultant',
      'Strategy Analyst',
      'Technical Support Engineer',
      'Network Engineer',
      'Cybersecurity Analyst',
      'Supply Chain Analyst',
      'Legal Associate',
      'Teacher / Educator',
    ],
  },
] as const

export const POPULAR_TARGET_ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Product Manager',
  'Business Analyst',
  'Digital Marketing Specialist',
  'HR Executive',
  'Fresher — Software Engineer',
] as const

export const TARGET_COMPANY_SUGGESTIONS = [
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Flipkart',
  'Amazon',
  'Swiggy',
  'Zomato',
  'PhonePe',
  'Paytm',
  'Microsoft',
  'Google',
  'Deloitte',
  'EY',
  'Startup (early stage)',
] as const
