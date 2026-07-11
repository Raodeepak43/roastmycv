'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ResumeData } from '@/lib/resume-builder/types'
import { createExperience, createProject } from '@/lib/resume-builder/types'
import { canUseAi, incrementAiUses } from '@/lib/resume-builder/usage'

const THEMES = {
  dark: {
    input: 'rb-form-input',
    label: 'rb-form-label',
    section: 'rb-form-section',
    sectionTitle: 'rb-form-section-title',
    aiBtn: 'rb-form-ai disabled:opacity-50',
    divider: 'mb-6 pb-6 border-b border-[#1a1a1a] last:border-0 last:mb-0 last:pb-0',
    addBullet: 'font-body text-[11px] text-dim hover:text-orange transition-colors',
    addBtn: 'rb-form-add',
  },
  light: {
    input: 'rb-input',
    label: 'rb-label',
    section: 'rb-section',
    sectionTitle: 'rb-section-title',
    aiBtn: 'rb-ai-btn disabled:opacity-50',
    divider: 'mb-6 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0',
    addBullet: 'font-body text-[11px] font-medium text-gray-500 hover:text-orange transition-colors',
    addBtn:
      'font-body text-[12px] font-semibold text-orange border border-orange/40 bg-white px-3 py-2 rounded-md hover:bg-orange/5 transition-colors',
  },
} as const

type StrengthenType = 'bullet' | 'summary' | 'project'

interface EditorProps {
  data: ResumeData
  onChange: (data: ResumeData) => void
  onUpgrade: () => void
  onAiUsed?: () => void
  theme?: keyof typeof THEMES
  /** When set, overrides localStorage usage (dashboard account mode) */
  checkCanUseAi?: () => boolean
  onAiConsumed?: () => void
  /** Label when AI requires login (public builder) */
  aiLockedLabel?: string
  aiUpgradeHref?: string
  /** Highlight a form section during guided tour */
  activeSection?: string | null
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
  className,
  disabled,
  upgradeHref,
}: {
  onClick?: () => void
  loading: boolean
  label?: string
  className?: string
  disabled?: boolean
  upgradeHref?: string
}) {
  if (disabled && upgradeHref) {
    return (
      <Link href={upgradeHref} className={className ?? 'font-body text-[11px] text-[#ff4500] hover:underline mt-1.5 inline-block'}>
        Upgrade for more
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={className ?? 'font-body text-[11px] text-orange hover:text-white transition-colors mt-1.5 disabled:opacity-50'}
    >
      {loading ? '⏳ Working…' : label}
    </button>
  )
}

export function ResumeEditorForm({
  data,
  onChange,
  onUpgrade,
  onAiUsed,
  theme = 'dark',
  checkCanUseAi,
  onAiConsumed,
  aiLockedLabel = '✨ AI improve karo',
  aiUpgradeHref = '/dashboard/plans',
  activeSection = null,
}: EditorProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const cls = THEMES[theme]
  const inputCls = cls.input
  const labelCls = cls.label
  const sectionCls = cls.section
  const sectionTitleCls = cls.sectionTitle
  const dividerCls = cls.divider
  const addBulletCls = cls.addBullet
  const addBtnCls = cls.addBtn

  const sectionHighlight = (id: string) =>
    activeSection === id ? `${sectionCls} rb-section-active` : sectionCls

  const patch = (partial: Partial<ResumeData>) => onChange({ ...data, ...partial })

  const aiLabel = (fallback?: string) => (checkCanUseAi ? aiLockedLabel : fallback)

  const aiDepleted = Boolean(checkCanUseAi && !checkCanUseAi())
  const aiBtnExtra = {
    disabled: aiDepleted,
    upgradeHref: checkCanUseAi ? aiUpgradeHref : undefined,
  }

  const runAi = async (key: string, text: string, type: StrengthenType, apply: (result: string) => void) => {
    if (!text.trim()) return
    const allowed = checkCanUseAi ? checkCanUseAi() : canUseAi()
    if (!allowed) {
      onUpgrade()
      return
    }
    setLoadingKey(key)
    try {
      const result = await strengthen(text, type)
      if (onAiConsumed) {
        onAiConsumed()
      } else {
        incrementAiUses()
      }
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
      <div id="rb-section-personal" className={sectionHighlight('personal')}>
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
      <div id="rb-section-summary" className={sectionHighlight('summary')}>
        <h3 className={sectionTitleCls}>Professional Summary</h3>
        <textarea
          className={`${inputCls} resize-y min-h-[96px]`}
          rows={4}
          value={data.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          placeholder="2-3 sentences about your experience and impact…"
        />
        <AiButton
          className={cls.aiBtn}
          label={aiLabel()}
          loading={loadingKey === 'summary'}
          {...aiBtnExtra}
          onClick={() =>
            runAi('summary', data.summary, 'summary', (r) => patch({ summary: r }))
          }
        />
      </div>

      {/* Experience */}
      <div id="rb-section-experience" className={sectionHighlight('experience')}>
        <h3 className={sectionTitleCls}>Experience</h3>
        {data.experience.map((job, jobIdx) => (
          <div key={job.id} className={dividerCls}>
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
                  className={cls.aiBtn}
                  label={aiLabel('✨ Strengthen')}
                  loading={loadingKey === `b-${jobIdx}-${bIdx}`}
                  {...aiBtnExtra}
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
                className={addBulletCls}
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
          className={addBtnCls}
          onClick={() => patch({ experience: [...data.experience, createExperience()] })}
        >
          + Add Another Job
        </button>
      </div>

      {/* Projects */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Projects</h3>
        {data.projects.map((proj, pIdx) => (
          <div key={proj.id} className={`${dividerCls} mb-4 pb-4`}>
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
                  className={cls.aiBtn}
                  label={aiLabel('✨ AI enhance')}
                  loading={loadingKey === `p-${pIdx}`}
                  {...aiBtnExtra}
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
          className={addBtnCls}
          onClick={() => patch({ projects: [...data.projects, createProject()] })}
        >
          + Add Project
        </button>
      </div>

      {/* Skills */}
      <div id="rb-section-skills" className={sectionHighlight('skills')}>
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
      <div id="rb-section-education" className={sectionHighlight('education')}>
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
          className={addBtnCls}
          onClick={() => patch({ achievements: [...data.achievements, ''] })}
        >
          + Add More
        </button>
      </div>
    </div>
  )
}
