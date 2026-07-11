/**
 * URLs from Search Console coverage reports — boost internal links + sitemap priority.
 * Updated from exports dated 2026-07-08.
 */

/** Blog slugs: Discovered — currently not indexed (never crawled). */
export const GSC_DISCOVERED_BLOG_SLUGS = [
  'ats-resume-builder-free',
  'best-job-search-sites-india',
  'canva-resume-vs-builder',
  'cv-format-for-freshers',
  'cv-layout-examples',
  'cv-vs-resume-difference',
  'data-analyst-resume-guide',
  'data-scientist-resume-guide',
  'editable-resume-templates',
  'engineering-resume-guide',
  'how-many-pages-resume',
  'how-to-find-a-job-india',
  'how-to-make-resume-online',
  'how-to-write-a-cv',
  'it-jobs-resume-guide',
  'modern-cv-examples',
  'modern-resume-templates',
  'online-resume-maker-guide',
  'professional-cv-writing-guide',
  'project-manager-resume-guide',
  'remote-jobs-india-guide',
  'resume-action-verbs',
  'resume-examples-india',
  'resume-mistakes-to-avoid',
  'resume-skills-section',
  'resume-with-no-experience',
  'software-engineer-resume-guide',
  'ux-designer-resume-guide',
] as const

/** Blog slugs: Crawled — currently not indexed (quality / duplicate signals). */
export const GSC_CRAWLED_NOT_INDEXED_BLOG_SLUGS = [
  'resume-roast-vs-resume-review',
  'free-cv-maker-online',
] as const

/** Core paths discovered but not crawled. */
export const GSC_DISCOVERED_CORE_PATHS = ['/plans', '/privacy'] as const

export const GSC_INDEXING_PRIORITY_SLUGS = new Set<string>([
  ...GSC_DISCOVERED_BLOG_SLUGS,
  ...GSC_CRAWLED_NOT_INDEXED_BLOG_SLUGS,
])
