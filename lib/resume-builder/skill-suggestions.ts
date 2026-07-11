export const SKILL_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'React',
  'Next.js',
  'Node.js',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Git',
  'REST APIs',
  'System Design',
  'Data Structures',
  'Machine Learning',
  'Communication',
  'Problem Solving',
  'Team Leadership',
  'Project Management',
  'Agile',
  'Public Speaking',
  'Customer Service',
  'Microsoft Excel',
  'Data Analysis',
  'HTML/CSS',
  'Tailwind CSS',
  'GraphQL',
  'Kubernetes',
  'CI/CD',
  'Linux',
  'Figma',
  'SEO',
  'Digital Marketing',
] as const

export function filterSkillSuggestions(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase()
  const pool = q
    ? SKILL_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q))
    : [...SKILL_SUGGESTIONS]
  return pool.slice(0, limit)
}

export function appendSkillToField(current: string, skill: string): string {
  const parts = current
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.some((p) => p.toLowerCase() === skill.toLowerCase())) return current
  return [...parts, skill].join(', ')
}
