/** Plain-text CV from resume builder data (no PII emphasis — used for AI tools). */
import type { ResumeData } from '@/lib/resume-builder/types'

export function resumeDataToText(data: ResumeData): string {
  const parts: string[] = []

  const { personal, summary, experience, projects, skills, education, achievements } = data

  if (personal.fullName || personal.jobTitle) {
    parts.push([personal.fullName, personal.jobTitle].filter(Boolean).join(' — '))
  }
  if (personal.location) parts.push(personal.location)
  if (summary?.trim()) {
    parts.push('\nSUMMARY\n' + summary.trim())
  }

  if (experience.some((e) => e.company || e.jobTitle)) {
    parts.push('\nEXPERIENCE')
    for (const exp of experience) {
      if (!exp.company && !exp.jobTitle) continue
      const header = [exp.jobTitle, exp.company, exp.location].filter(Boolean).join(' | ')
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ')
      parts.push(`${header}${dates ? ` (${dates})` : ''}`)
      for (const b of exp.bullets) {
        if (b.trim()) parts.push(`• ${b.trim()}`)
      }
    }
  }

  if (projects.some((p) => p.name)) {
    parts.push('\nPROJECTS')
    for (const p of projects) {
      if (!p.name) continue
      parts.push(`${p.name}${p.techStack ? ` (${p.techStack})` : ''}`)
      if (p.description?.trim()) parts.push(p.description.trim())
    }
  }

  const skillLines = [
    skills.languages && `Languages: ${skills.languages}`,
    skills.frameworks && `Frameworks: ${skills.frameworks}`,
    skills.tools && `Tools: ${skills.tools}`,
    skills.databases && `Databases: ${skills.databases}`,
  ].filter(Boolean)
  if (skillLines.length) {
    parts.push('\nSKILLS\n' + skillLines.join('\n'))
  }

  if (education.degree || education.university) {
    parts.push('\nEDUCATION')
    parts.push(
      [education.degree, education.university, education.gradYear].filter(Boolean).join(' — '),
    )
    if (education.gpa) parts.push(`GPA: ${education.gpa}`)
  }

  if (achievements.some((a) => a.trim())) {
    parts.push('\nACHIEVEMENTS')
    for (const a of achievements) {
      if (a.trim()) parts.push(`• ${a.trim()}`)
    }
  }

  return parts.join('\n').trim()
}
