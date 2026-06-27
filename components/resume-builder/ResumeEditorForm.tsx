'use client'

import { useState } from 'react'
import type { ResumeData } from '@/lib/resume-builder/types'
import { createExperience, createProject } from '@/lib/resume-builder/types'
import { canUseAi, incrementAiUses } from '@/lib/resume-builder/usage'

const inputCls =
  'w-full bg-black border border-border px-3 py-2.5 font-body text-sm text-white placeholder:text-[#555] focus:border-orange outline-none'
const labelCls = 'font-body text-[11px] text-dim uppercase tracking-[0.1em] mb-1.5 block'
const sectionCls = 'border border-border bg-[#0a0a0a] p-4 mb-4'
const sectionTitleCls = 'font-body text-[11px] text-orange uppercase tracking-[0.12em] mb-4'

type StrengthenType = 'bullet' | 'summary' | 'project'

interface EditorProps {
  data: ResumeData
  onChange: (data: ResumeData) => void
  onUpgrade: () => void
  onAiUsed?: () => void
}

async function strengthen(text: string, type: StrengthenType): Promise<string> {
  const res = await fetch('/api/strengthen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed')
  return json.result as string
}

function AiButton({
  onClick,
  loading,
  label = '✨ AI improve karo',
}: {
  onClick: () => void
  loading: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="font-body text-[11px] text-orange hover:text-white transition-colors mt-1.5 disabled:opacity-50"
    >
      {loading ? '⏳ Working…' : label}
    </button>
  )
}

export function ResumeEditorForm({ data, onChange, onUpgrade, onAiUsed }: EditorProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const patch = (partial: Partial<ResumeData>) => onChange({ ...data, ...partial })

  const runAi = async (key: string, text: string, type: StrengthenType, apply: (result: string) => void) => {
    if (!text.trim()) return
    if (!canUseAi()) {
      onUpgrade()
      return
    }
    setLoadingKey(key)
    try {
      const result = await strengthen(text, type)
      incrementAiUses()
      onAiUsed?.()
      apply(result)
    } catch {
      /* ignore */
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <div>
      {/* Personal */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Personal Info</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Name</label>
            <input
              className={inputCls}
              value={data.personal.fullName}
              onChange={(e) => patch({ personal: { ...data.personal, fullName: e.target.value } })}
              placeholder="Deepak Yadav"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Job Title</label>
            <input
              className={inputCls}
              value={data.personal.jobTitle}
              onChange={(e) => patch({ personal: { ...data.personal, jobTitle: e.target.value } })}
              placeholder="Software Development Engineer"
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              className={inputCls}
              type="email"
              value={data.personal.email}
              onChange={(e) => patch({ personal: { ...data.personal, email: e.target.value } })}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              className={inputCls}
              value={data.personal.phone}
              onChange={(e) => patch({ personal: { ...data.personal, phone: e.target.value } })}
            />
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input
              className={inputCls}
              value={data.personal.location}
              onChange={(e) => patch({ personal: { ...data.personal, location: e.target.value } })}
              placeholder="Bangalore, India"
            />
          </div>
          <div>
            <label className={labelCls}>LinkedIn URL</label>
            <input
              className={inputCls}
              value={data.personal.linkedin}
              onChange={(e) => patch({ personal: { ...data.personal, linkedin: e.target.value } })}
              placeholder="linkedin.com/in/you"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Professional Summary</h3>
        <textarea
          className={`${inputCls} resize-y min-h-[96px]`}
          rows={4}
          value={data.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          placeholder="2-3 sentences about your experience and impact…"
        />
        <AiButton
          loading={loadingKey === 'summary'}
          onClick={() =>
            runAi('summary', data.summary, 'summary', (r) => patch({ summary: r }))
          }
        />
      </div>

      {/* Experience */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Experience</h3>
        {data.experience.map((job, jobIdx) => (
          <div key={job.id} className="mb-6 pb-6 border-b border-border last:border-0 last:mb-0 last:pb-0">
            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <div>
                <label className={labelCls}>Company</label>
                <input
                  className={inputCls}
                  value={job.company}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    experience[jobIdx] = { ...job, company: e.target.value }
                    patch({ experience })
                  }}
                />
              </div>
              <div>
                <label className={labelCls}>Job Title</label>
                <input
                  className={inputCls}
                  value={job.jobTitle}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    experience[jobIdx] = { ...job, jobTitle: e.target.value }
                    patch({ experience })
                  }}
                />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input
                  className={inputCls}
                  value={job.location}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    experience[jobIdx] = { ...job, location: e.target.value }
                    patch({ experience })
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Start</label>
                  <input
                    className={inputCls}
                    value={job.startDate}
                    placeholder="Jan 2022"
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[jobIdx] = { ...job, startDate: e.target.value }
                      patch({ experience })
                    }}
                  />
                </div>
                <div>
                  <label className={labelCls}>End</label>
                  <input
                    className={inputCls}
                    value={job.endDate}
                    placeholder="Present"
                    onChange={(e) => {
                      const experience = [...data.experience]
                      experience[jobIdx] = { ...job, endDate: e.target.value }
                      patch({ experience })
                    }}
                  />
                </div>
              </div>
            </div>
            {job.bullets.map((bullet, bIdx) => (
              <div key={bIdx} className="mb-3">
                <label className={labelCls}>Bullet {bIdx + 1}</label>
                <textarea
                  className={`${inputCls} resize-y min-h-[56px]`}
                  rows={2}
                  value={bullet}
                  onChange={(e) => {
                    const experience = [...data.experience]
                    const bullets = [...job.bullets]
                    bullets[bIdx] = e.target.value
                    experience[jobIdx] = { ...job, bullets }
                    patch({ experience })
                  }}
                />
                <AiButton
                  label="✨ Strengthen"
                  loading={loadingKey === `b-${jobIdx}-${bIdx}`}
                  onClick={() =>
                    runAi(`b-${jobIdx}-${bIdx}`, bullet, 'bullet', (r) => {
                      const experience = [...data.experience]
                      const bullets = [...job.bullets]
                      bullets[bIdx] = r
                      experience[jobIdx] = { ...job, bullets }
                      patch({ experience })
                    })
                  }
                />
              </div>
            ))}
            {job.bullets.length < 5 && (
              <button
                type="button"
                className="font-body text-[11px] text-dim hover:text-orange"
                onClick={() => {
                  const experience = [...data.experience]
                  experience[jobIdx] = { ...job, bullets: [...job.bullets, ''] }
                  patch({ experience })
                }}
              >
                + Add bullet
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="font-body text-[12px] text-orange border border-orange/40 px-3 py-2 hover:bg-orange/10 transition-colors"
          onClick={() => patch({ experience: [...data.experience, createExperience()] })}
        >
          + Add Another Job
        </button>
      </div>

      {/* Projects */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Projects</h3>
        {data.projects.map((proj, pIdx) => (
          <div key={proj.id} className="mb-4 pb-4 border-b border-border last:border-0">
            <div className="grid gap-3 mb-2">
              <div>
                <label className={labelCls}>Project Name</label>
                <input
                  className={inputCls}
                  value={proj.name}
                  onChange={(e) => {
                    const projects = [...data.projects]
                    projects[pIdx] = { ...proj, name: e.target.value }
                    patch({ projects })
                  }}
                />
              </div>
              <div>
                <label className={labelCls}>Tech Stack</label>
                <input
                  className={inputCls}
                  value={proj.techStack}
                  onChange={(e) => {
                    const projects = [...data.projects]
                    projects[pIdx] = { ...proj, techStack: e.target.value }
                    patch({ projects })
                  }}
                  placeholder="React, Node.js, AWS"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={`${inputCls} resize-y min-h-[56px]`}
                  rows={2}
                  value={proj.description}
                  onChange={(e) => {
                    const projects = [...data.projects]
                    projects[pIdx] = { ...proj, description: e.target.value }
                    patch({ projects })
                  }}
                />
                <AiButton
                  label="✨ AI enhance"
                  loading={loadingKey === `p-${pIdx}`}
                  onClick={() =>
                    runAi(`p-${pIdx}`, proj.description, 'project', (r) => {
                      const projects = [...data.projects]
                      projects[pIdx] = { ...proj, description: r }
                      patch({ projects })
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="font-body text-[12px] text-orange border border-orange/40 px-3 py-2 hover:bg-orange/10 transition-colors"
          onClick={() => patch({ projects: [...data.projects, createProject()] })}
        >
          + Add Project
        </button>
      </div>

      {/* Skills */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Skills</h3>
        <div className="grid gap-3">
          {(
            [
              ['languages', 'Languages'],
              ['frameworks', 'Frameworks'],
              ['tools', 'Tools / Cloud'],
              ['databases', 'Databases'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input
                className={inputCls}
                value={data.skills[key]}
                onChange={(e) =>
                  patch({ skills: { ...data.skills, [key]: e.target.value } })
                }
                placeholder="Comma-separated"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Education</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Degree</label>
            <input
              className={inputCls}
              value={data.education.degree}
              onChange={(e) =>
                patch({ education: { ...data.education, degree: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={labelCls}>University</label>
            <input
              className={inputCls}
              value={data.education.university}
              onChange={(e) =>
                patch({ education: { ...data.education, university: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={labelCls}>Graduation Year</label>
            <input
              className={inputCls}
              value={data.education.gradYear}
              onChange={(e) =>
                patch({ education: { ...data.education, gradYear: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={labelCls}>GPA (optional)</label>
            <input
              className={inputCls}
              value={data.education.gpa}
              onChange={(e) =>
                patch({ education: { ...data.education, gpa: e.target.value } })
              }
            />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Achievements &amp; Awards</h3>
        {data.achievements.map((ach, aIdx) => (
          <div key={aIdx} className="mb-3">
            <input
              className={inputCls}
              value={ach}
              onChange={(e) => {
                const achievements = [...data.achievements]
                achievements[aIdx] = e.target.value
                patch({ achievements })
              }}
              placeholder={`Achievement ${aIdx + 1}`}
            />
          </div>
        ))}
        <button
          type="button"
          className="font-body text-[12px] text-orange border border-orange/40 px-3 py-2 hover:bg-orange/10 transition-colors"
          onClick={() => patch({ achievements: [...data.achievements, ''] })}
        >
          + Add More
        </button>
      </div>
    </div>
  )
}
