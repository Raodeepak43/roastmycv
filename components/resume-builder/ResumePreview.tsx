import type { ReactNode } from 'react'
import type { ResumeData, ResumeExperience, ResumeProject } from '@/lib/resume-builder/types'
import { getTemplateLayout, resolveTemplateId } from '@/lib/resume-builder/templates'
import type { PreviewSection } from '@/lib/resume-builder/wizard-steps'
import './resume-templates.css'

export type HighlightSection = PreviewSection

function sectionClass(active: boolean, interactive: boolean) {
  return active && interactive ? ' rb-resume__section--active' : ''
}

interface Props {
  data: ResumeData
  templateId?: string
  highlightSection?: HighlightSection
  /** When false, omits id="resume" (for gallery thumbnails). Default true. */
  exportId?: boolean
  /** When false, disables step highlight outlines. Default true. */
  interactive?: boolean
}

function SectionTitle({ children, spaced }: { children: ReactNode; spaced?: boolean }) {
  return (
    <div className={`rb-resume__section-title${spaced ? ' rb-resume__section-title--spaced' : ''}`}>
      {children}
    </div>
  )
}

function HeaderBlock({
  data,
  hi,
  interactive,
}: {
  data: ResumeData
  hi?: HighlightSection
  interactive: boolean
}) {
  const { personal } = data
  return (
    <div
      data-rb-section="header"
      className={`rb-resume__header${sectionClass(hi === 'header', interactive)}`}
    >
      <h1 className="rb-resume__name">{personal.fullName || 'Your Name'}</h1>
      {personal.jobTitle && <div className="rb-resume__title">{personal.jobTitle}</div>}
      {(personal.email || personal.phone || personal.location || personal.linkedin) && (
        <div className="rb-resume__contact">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      )}
    </div>
  )
}

function SummaryBlock({
  data,
  hi,
  interactive,
}: {
  data: ResumeData
  hi?: HighlightSection
  interactive: boolean
}) {
  return (
    <div
      data-rb-section="summary"
      className={`rb-resume__section${sectionClass(hi === 'summary', interactive)}`}
    >
      <SectionTitle>Professional Summary</SectionTitle>
      <p className="rb-resume__body">{data.summary || 'Your summary will appear here.'}</p>
    </div>
  )
}

function ExperienceBlock({
  experience,
  hi,
  interactive,
}: {
  experience: ResumeExperience[]
  hi?: HighlightSection
  interactive: boolean
}) {
  return (
    <div
      data-rb-section="experience"
      className={`rb-resume__section${sectionClass(hi === 'experience', interactive)}`}
    >
      <SectionTitle spaced>Professional Experience</SectionTitle>
      {experience.some((e) => e.company || e.jobTitle) ? (
        experience.map((job) => {
          if (!job.company && !job.jobTitle) return null
          const bullets = job.bullets.filter((b) => b.trim())
          return (
            <div key={job.id} className="rb-resume__job">
              <div className="rb-resume__job-row">
                <span className="rb-resume__company">{job.company || 'Company'}</span>
                {(job.startDate || job.endDate) && (
                  <span className="rb-resume__dates">
                    {job.startDate} – {job.endDate || 'Present'}
                  </span>
                )}
              </div>
              <div className="rb-resume__role">
                {[job.jobTitle, job.location].filter(Boolean).join(' · ')}
              </div>
              {bullets.length > 0 && (
                <ul className="rb-resume__list">
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })
      ) : (
        <p className="rb-resume__body rb-resume__placeholder">Experience entries will appear here.</p>
      )}
    </div>
  )
}

function ProjectsBlock({
  projects,
  hi,
  interactive,
  showEmpty,
}: {
  projects: ResumeProject[]
  hi?: HighlightSection
  interactive: boolean
  showEmpty?: boolean
}) {
  if (!projects.some((p) => p.name) && !showEmpty) return null
  return (
    <div
      data-rb-section="additional"
      className={`rb-resume__section${sectionClass(hi === 'additional', interactive)}`}
    >
      <SectionTitle spaced>Key Projects</SectionTitle>
      {projects.some((p) => p.name) ? (
        projects.map((p) => {
          if (!p.name) return null
          return (
            <div key={p.id} className="rb-resume__job">
              <div className="rb-resume__project-name">
                {p.name}
                {p.techStack && <span className="rb-resume__project-tech"> · {p.techStack}</span>}
              </div>
              {p.description && <div className="rb-resume__body rb-resume__project-desc">{p.description}</div>}
            </div>
          )
        })
      ) : (
        <p className="rb-resume__body rb-resume__placeholder">Optional projects and awards.</p>
      )}
    </div>
  )
}

function SkillsBlock({
  skills,
  hi,
  interactive,
}: {
  skills: ResumeData['skills']
  hi?: HighlightSection
  interactive: boolean
}) {
  return (
    <div
      data-rb-section="skills"
      className={`rb-resume__section${sectionClass(hi === 'skills', interactive)}`}
    >
      <SectionTitle>Technical Skills</SectionTitle>
      {Object.values(skills).some((s) => s.trim()) ? (
        <div className="rb-resume__skills-grid">
          {skills.languages && (
            <>
              <span className="rb-resume__skill-label">Languages:</span>
              <span className="rb-resume__skill-value">{skills.languages}</span>
            </>
          )}
          {skills.frameworks && (
            <>
              <span className="rb-resume__skill-label">Frameworks:</span>
              <span className="rb-resume__skill-value">{skills.frameworks}</span>
            </>
          )}
          {skills.tools && (
            <>
              <span className="rb-resume__skill-label">Tools/Cloud:</span>
              <span className="rb-resume__skill-value">{skills.tools}</span>
            </>
          )}
          {skills.databases && (
            <>
              <span className="rb-resume__skill-label">Databases:</span>
              <span className="rb-resume__skill-value">{skills.databases}</span>
            </>
          )}
        </div>
      ) : (
        <p className="rb-resume__body rb-resume__placeholder">Skills will appear here.</p>
      )}
    </div>
  )
}

function EducationBlock({
  education,
  hi,
  interactive,
}: {
  education: ResumeData['education']
  hi?: HighlightSection
  interactive: boolean
}) {
  return (
    <div
      data-rb-section="education"
      className={`rb-resume__section${sectionClass(hi === 'education', interactive)}`}
    >
      <SectionTitle>Education</SectionTitle>
      {education.degree || education.university ? (
        <div className="rb-resume__edu-row">
          <div>
            <div className="rb-resume__degree">{education.degree || 'Degree'}</div>
            <div className="rb-resume__school">
              {education.university}
              {education.gpa ? ` · GPA: ${education.gpa}` : ''}
            </div>
          </div>
          {education.gradYear && <div className="rb-resume__dates">{education.gradYear}</div>}
        </div>
      ) : (
        <p className="rb-resume__body rb-resume__placeholder">Education details will appear here.</p>
      )}
    </div>
  )
}

function AchievementsBlock({
  achievements,
  hi,
  interactive,
}: {
  achievements: string[]
  hi?: HighlightSection
  interactive: boolean
}) {
  if (!achievements.some((a) => a.trim())) return null
  return (
    <div
      data-rb-section="additional"
      className={`rb-resume__section${sectionClass(hi === 'additional', interactive)}`}
    >
      <SectionTitle>Achievements &amp; Awards</SectionTitle>
      <ul className="rb-resume__list">
        {achievements.filter((a) => a.trim()).map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  )
}

function StandardBody({ data, hi, interactive }: { data: ResumeData; hi?: HighlightSection; interactive: boolean }) {
  return (
    <>
      <SummaryBlock data={data} hi={hi} interactive={interactive} />
      <ExperienceBlock experience={data.experience} hi={hi} interactive={interactive} />
      <ProjectsBlock projects={data.projects} hi={hi} interactive={interactive} showEmpty={hi === 'additional'} />
      <SkillsBlock skills={data.skills} hi={hi} interactive={interactive} />
      <EducationBlock education={data.education} hi={hi} interactive={interactive} />
      <AchievementsBlock achievements={data.achievements} hi={hi} interactive={interactive} />
    </>
  )
}

function FresherBody({ data, hi, interactive }: { data: ResumeData; hi?: HighlightSection; interactive: boolean }) {
  return (
    <>
      <SummaryBlock data={data} hi={hi} interactive={interactive} />
      <EducationBlock education={data.education} hi={hi} interactive={interactive} />
      <SkillsBlock skills={data.skills} hi={hi} interactive={interactive} />
      <ExperienceBlock experience={data.experience} hi={hi} interactive={interactive} />
      <ProjectsBlock projects={data.projects} hi={hi} interactive={interactive} showEmpty={hi === 'additional'} />
      <AchievementsBlock achievements={data.achievements} hi={hi} interactive={interactive} />
    </>
  )
}

export function ResumePreview({
  data,
  templateId,
  highlightSection,
  exportId = true,
  interactive = true,
}: Props) {
  const tpl = resolveTemplateId(templateId ?? data.templateId)
  const layout = getTemplateLayout(tpl)
  const hi = highlightSection
  const rootClass = `rb-resume rb-resume--${tpl} rb-resume--layout-${layout}`
  const rootProps = exportId ? { id: 'resume' as const } : {}

  if (layout === 'sidebar') {
    return (
      <div {...rootProps} className={rootClass}>
        <aside className="rb-resume__sidebar">
          <HeaderBlock data={data} hi={hi} interactive={interactive} />
          <SkillsBlock skills={data.skills} hi={hi} interactive={interactive} />
          <EducationBlock education={data.education} hi={hi} interactive={interactive} />
        </aside>
        <main className="rb-resume__main">
          <SummaryBlock data={data} hi={hi} interactive={interactive} />
          <ExperienceBlock experience={data.experience} hi={hi} interactive={interactive} />
          <ProjectsBlock projects={data.projects} hi={hi} interactive={interactive} showEmpty={hi === 'additional'} />
          <AchievementsBlock achievements={data.achievements} hi={hi} interactive={interactive} />
        </main>
      </div>
    )
  }

  if (layout === 'header-band') {
    const { personal } = data
    return (
      <div {...rootProps} className={rootClass}>
        <div
          data-rb-section="header"
          className={`rb-resume__band${sectionClass(hi === 'header', interactive)}`}
        >
          <h1 className="rb-resume__name">{personal.fullName || 'Your Name'}</h1>
          {personal.jobTitle && <div className="rb-resume__title">{personal.jobTitle}</div>}
          {(personal.email || personal.phone || personal.location || personal.linkedin) && (
            <div className="rb-resume__contact">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && <span>{personal.linkedin}</span>}
            </div>
          )}
        </div>
        <div className="rb-resume__content">
          <StandardBody data={data} hi={hi} interactive={interactive} />
        </div>
      </div>
    )
  }

  return (
    <div {...rootProps} className={rootClass}>
      <HeaderBlock data={data} hi={hi} interactive={interactive} />
      {layout === 'fresher' ? (
        <FresherBody data={data} hi={hi} interactive={interactive} />
      ) : (
        <StandardBody data={data} hi={hi} interactive={interactive} />
      )}
    </div>
  )
}
