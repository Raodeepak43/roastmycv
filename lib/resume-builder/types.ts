export interface ResumeExperience {
  id: string
  company: string
  jobTitle: string
  location: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface ResumeProject {
  id: string
  name: string
  techStack: string
  description: string
}

export interface ResumeSkills {
  languages: string
  frameworks: string
  tools: string
  databases: string
}

export interface ResumeEducation {
  degree: string
  university: string
  gradYear: string
  gpa: string
}

export interface ResumePersonal {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedin: string
}

import type { ResumeTemplateId } from '@/lib/resume-builder/templates'
import { DEFAULT_TEMPLATE_ID } from '@/lib/resume-builder/templates'

export interface ResumeData {
  templateId?: ResumeTemplateId
  personal: ResumePersonal
  summary: string
  experience: ResumeExperience[]
  projects: ResumeProject[]
  skills: ResumeSkills
  education: ResumeEducation
  achievements: string[]
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function createExperience(): ResumeExperience {
  return {
    id: uid(),
    company: '',
    jobTitle: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: ['', '', ''],
  }
}

export function createProject(): ResumeProject {
  return { id: uid(), name: '', techStack: '', description: '' }
}

export function defaultResumeData(): ResumeData {
  return {
    templateId: DEFAULT_TEMPLATE_ID,
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    },
    summary: '',
    experience: [createExperience()],
    projects: [createProject()],
    skills: { languages: '', frameworks: '', tools: '', databases: '' },
    education: { degree: '', university: '', gradYear: '', gpa: '' },
    achievements: ['', ''],
  }
}
