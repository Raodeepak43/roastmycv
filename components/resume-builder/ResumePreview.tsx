import type { ResumeData } from '@/lib/resume-builder/types'

export function ResumePreview({ data }: { data: ResumeData }) {
  const { personal, summary, experience, projects, skills, education, achievements } = data
  const contact = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean)

  return (
    <div
      id="resume"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '11px',
        color: '#1a1a1a',
        lineHeight: 1.5,
        padding: '32px 36px',
        maxWidth: '780px',
        background: 'white',
        borderLeft: '4px solid #2563EB',
      }}
    >
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1.5px solid #e5e7eb' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 3px 0' }}>
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.jobTitle && (
          <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', marginBottom: 5 }}>
            {personal.jobTitle}
          </div>
        )}
        {contact.length > 0 && (
          <div style={{ fontSize: 10, color: '#555', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
          </div>
        )}
      </div>

      {summary && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#2563EB',
              borderBottom: '1px solid #DBEAFE',
              paddingBottom: 3,
              marginBottom: 6,
            }}
          >
            Professional Summary
          </div>
          <p style={{ fontSize: 10.5, color: '#333', lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.some((e) => e.company || e.jobTitle) && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#2563EB',
              borderBottom: '1px solid #DBEAFE',
              paddingBottom: 3,
              marginBottom: 8,
            }}
          >
            Professional Experience
          </div>
          {experience.map((job) => {
            if (!job.company && !job.jobTitle) return null
            const bullets = job.bullets.filter((b) => b.trim())
            return (
              <div key={job.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>
                    {job.company || 'Company'}
                  </span>
                  {(job.startDate || job.endDate) && (
                    <span style={{ fontSize: 10, color: '#666' }}>
                      {job.startDate} – {job.endDate || 'Present'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  {[job.jobTitle, job.location].filter(Boolean).join(' · ')}
                </div>
                {bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 14, listStyle: 'disc' }}>
                    {bullets.map((b, i) => (
                      <li
                        key={i}
                        style={{ fontSize: 10.5, color: '#333', marginBottom: 3, lineHeight: 1.5 }}
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      {projects.some((p) => p.name) && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#2563EB',
              borderBottom: '1px solid #DBEAFE',
              paddingBottom: 3,
              marginBottom: 8,
            }}
          >
            Key Projects
          </div>
          {projects.map((p) => {
            if (!p.name) return null
            return (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a' }}>
                  {p.name}
                  {p.techStack && (
                    <span style={{ fontSize: 10, color: '#2563EB', fontWeight: 400 }}>
                      {' '}
                      · {p.techStack}
                    </span>
                  )}
                </div>
                {p.description && (
                  <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.5, marginTop: 2 }}>
                    {p.description}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {Object.values(skills).some((s) => s.trim()) && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#2563EB',
              borderBottom: '1px solid #DBEAFE',
              paddingBottom: 3,
              marginBottom: 6,
            }}
          >
            Technical Skills
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 4 }}>
            {skills.languages && (
              <>
                <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>Languages:</span>
                <span style={{ fontSize: 10, color: '#333' }}>{skills.languages}</span>
              </>
            )}
            {skills.frameworks && (
              <>
                <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>Frameworks:</span>
                <span style={{ fontSize: 10, color: '#333' }}>{skills.frameworks}</span>
              </>
            )}
            {skills.tools && (
              <>
                <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>Tools/Cloud:</span>
                <span style={{ fontSize: 10, color: '#333' }}>{skills.tools}</span>
              </>
            )}
            {skills.databases && (
              <>
                <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>Databases:</span>
                <span style={{ fontSize: 10, color: '#333' }}>{skills.databases}</span>
              </>
            )}
          </div>
        </div>
      )}

      {(education.degree || education.university) && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#2563EB',
              borderBottom: '1px solid #DBEAFE',
              paddingBottom: 3,
              marginBottom: 6,
            }}
          >
            Education
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>
                {education.degree}
              </div>
              <div style={{ fontSize: 10, color: '#555' }}>
                {education.university}
                {education.gpa ? ` · GPA: ${education.gpa}` : ''}
              </div>
            </div>
            {education.gradYear && (
              <div style={{ fontSize: 10, color: '#666' }}>{education.gradYear}</div>
            )}
          </div>
        </div>
      )}

      {achievements.some((a) => a.trim()) && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#2563EB',
              borderBottom: '1px solid #DBEAFE',
              paddingBottom: 3,
              marginBottom: 6,
            }}
          >
            Achievements &amp; Awards
          </div>
          <ul style={{ margin: 0, paddingLeft: 14, listStyle: 'disc' }}>
            {achievements.filter((a) => a.trim()).map((a, i) => (
              <li key={i} style={{ fontSize: 10.5, color: '#333', marginBottom: 3 }}>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
