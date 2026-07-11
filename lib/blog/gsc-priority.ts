/** Blog slugs with Search Console impressions — show tool CTA above the fold. */
import {
  GSC_CRAWLED_NOT_INDEXED_BLOG_SLUGS,
  GSC_DISCOVERED_BLOG_SLUGS,
  GSC_INDEXING_PRIORITY_SLUGS,
} from '@/lib/blog/gsc-indexing'

export const GSC_PRIORITY_BLOG_SLUGS = new Set<string>([
  '12th-pass-resume-kaise-banaye',
  '10th-pass-resume-kaise-banaye',
  'iti-diploma-resume-format-india',
  'biodata-maker-for-job-india',
  'zety-resume-maker-free-alternative-india',
  'zety-resume-builder-vs-mycvroast-india',
  'free-resume-review-online-india-2026',
  'bio-data-format-for-job-pdf-free',
  '12th-pass-bpo-resume-format',
  'cv-for-students-guide',
  'work-experience-resume-section',
  'gemini-resume-roast-prompt-india',
  'ats-friendly-resume',
  'internship-resume-guide',
  'fresher-resume-format',
  'student-resume-guide',
  'cv-kaise-banaye',
  'mycvroast-ai-tools-guide',
  'why-resume-rejected',
  'what-is-resume-roast',
  'free-resume-checker-india',
  ...GSC_DISCOVERED_BLOG_SLUGS,
  ...GSC_CRAWLED_NOT_INDEXED_BLOG_SLUGS,
])

export function isGscPriorityBlog(slug: string): boolean {
  return GSC_PRIORITY_BLOG_SLUGS.has(slug) || GSC_INDEXING_PRIORITY_SLUGS.has(slug)
}
