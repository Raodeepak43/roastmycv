import type { ReactNode } from 'react'
import type { ResumeData } from '@/lib/resume-builder/types'
import { resolveTemplateId } from '@/lib/resume-builder/templates'
import type { PreviewSection } from '@/lib/resume-builder/wizard-steps'
import './resume-templates.css'

export type HighlightSection = PreviewSection

function sectionClass(active: boolean) {
  return active ? ' rb-resume__section--active' : ''
}

interface Props {
  data: ResumeData
  templateId?: string
  highlightSection?: HighlightSection
}

function SectionTitle({ children, spaced }: { children: ReactNode; spaced?: boolean }) {
  return (
    <div className={`rb-resume__section-title${spaced ? ' rb-resume__section-title--spaced' : ''}`}>
      {children}
    </div>
  )
}

export function ResumePreview({ data, templateId, highlightSection }: Props) {
  const tpl = resolveTemplateId(templateId ?? data.templateId)
  const { personal, summary, experience, projects, skills, education, achievements } = data
  const hi = highlightSection

  return (
    <div id="resume" className={`rb-resume rb-resume--${tpl}`}>
      <div
        data-rb-section="header"
        className={`rb-resume__header${sectionClass(hi === 'header')}`}
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

      <div
        data-rb-section="summary"
        className={`rb-resume__section${sectionClass(hi === 'summary')}`}
      >
        <SectionTitle>Professional Summary</SectionTitle>
        <p className="rb-resume__body">{summary || 'Your summary will appear here.'}</p>
      </div>

      <div
        data-rb-section="experience"
        className={`rb-resume__section${sectionClass(hi === 'experience')}`}
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
          <p className="rb-resume__body" style={{ color: '#94a3b8' }}>
            Experience entries will appear here.
          </p>
        )}
      </div>

      {(projects.some((p) => p.name) || hi === 'additional') && (
        <div
          data-rb-section="additional"
          className={`rb-resume__section${sectionClass(hi === 'additional')}`}
        >
          <SectionTitle spaced>Key Projects</SectionTitle>
          {projects.some((p) => p.name) ? (
            projects.map((p) => {
              if (!p.name) return null
              return (
                <div key={p.id} className="rb-resume__job">
                  <div className="rb-resume__project-name">
                    {p.name}
                    {p.techStack && (
                      <span className="rb-resume__project-tech"> · {p.techStack}</span>
                    )}
                  </div>
                  {p.description && (
                    <div className="rb-resume__body" style={{ marginTop: 2 }}>
                      {p.description}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <p className="rb-resume__body" style={{ color: '#94a3b8' }}>
              Optional projects and awards.
            </p>
          )}
        </div>
      )}

      <div
        data-rb-section="skills"
        className={`rb-resume__section${sectionClass(hi === 'skills')}`}
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
          <p className="rb-resume__body" style={{ color: '#94a3b8' }}>
            Skills will appear here.
          </p>
        )}
      </div>

      <div
        data-rb-section="education"
        className={`rb-resume__section${sectionClass(hi === 'education')}`}
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
            {education.gradYear && (
              <div className="rb-resume__dates">{education.gradYear}</div>
            )}
          </div>
        ) : (
          <p className="rb-resume__body" style={{ color: '#94a3b8' }}>
            Education details will appear here.
          </p>
        )}
      </div>

      {achievements.some((a) => a.trim()) && (
        <div
          data-rb-section="additional"
          className={`rb-resume__section${sectionClass(hi === 'additional')}`}
        >
          <SectionTitle>Achievements &amp; Awards</SectionTitle>
          <ul className="rb-resume__list">
            {achievements.filter((a) => a.trim()).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
