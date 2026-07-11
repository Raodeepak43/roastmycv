/**
 * Report-only SEO metadata validation for blog posts.
 * Run: npm run seo:validate
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

const INCOMPLETE_SINGLE_WORD_ENDINGS =
  /\b(The|A|An|For|To|And|Or|In|On|From|Your|Off|Service|Build a Job|A Step|\(Step)\s*$/i

function hasIncompleteSerpEnding(title) {
  const t = String(title).trim()
  if (!t) return true
  if (/-(?:by-step|up|ready|campus|based|page|powered|friendly|sized|listing)\s*$/i.test(t)) return false
  if (/\b(?:Step-by-Step|Follow-Up|Job-Ready|Off-Campus|One-Page|Service-Based|Any Job|With AI|With Examples|Online Tool)\s*$/i.test(t)) return false
  if (/\bStep\s*$/i.test(t) && !/step-by-step\s*$/i.test(t)) return true
  if (/\bFollow\s*$/i.test(t) && !/follow-up\s*$/i.test(t)) return true
  if (/\bJob\s*$/i.test(t) && !/\b(?:Any|Every|New|Remote|Dream|Target|First|Side|Day|Full|Part)\s+Job\s*$/i.test(t)) return true
  if (/\bWith\s*$/i.test(t)) return true
  return INCOMPLETE_SINGLE_WORD_ENDINGS.test(t)
}

const BRAND_SUFFIX = ' | MyCVRoast'

function finalRenderedTitle(metaTitle, title) {
  const base = (metaTitle?.trim() || title.trim())
  return `${base}${BRAND_SUFFIX}`
}

const warnings = []
const metaTitles = new Map()
const descriptions = new Map()

for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '')
  const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8'))
  const title = String(data.title ?? '')
  const metaTitle = data.metaTitle ? String(data.metaTitle) : ''
  const description = data.description ? String(data.description) : ''
  const url = `/blog/${slug}`

  if (!metaTitle) warnings.push({ url, rule: 'empty-metaTitle', value: metaTitle })
  if (!description) warnings.push({ url, rule: 'missing-description', value: description })
  if (metaTitle && metaTitle.length < 15)
    warnings.push({ url, rule: 'title-too-short', value: metaTitle })
  if (metaTitle && /^\w+$/.test(metaTitle.trim()))
    warnings.push({ url, rule: 'suspicious-one-word-title', value: metaTitle })
  if (metaTitle && hasIncompleteSerpEnding(metaTitle))
    warnings.push({ url, rule: 'incomplete-title-ending', value: metaTitle })
  if (metaTitle && /…/.test(metaTitle))
    warnings.push({ url, rule: 'title-contains-ellipsis', value: metaTitle })
  if (metaTitle && /Free Tool Guide$/i.test(metaTitle))
    warnings.push({ url, rule: 'generic-tool-title', value: metaTitle })
  if (metaTitle && /\s{2,}/.test(metaTitle))
    warnings.push({ url, rule: 'double-space-in-title', value: metaTitle })
  if (metaTitle && /[\(\[]$/.test(metaTitle.trim()))
    warnings.push({ url, rule: 'unmatched-bracket-in-title', value: metaTitle })
  if (metaTitle && /-$/.test(metaTitle.trim()))
    warnings.push({ url, rule: 'title-ends-with-hyphen', value: metaTitle })
  if (description && description.length > 170)
    warnings.push({ url, rule: 'description-too-long', value: description.slice(0, 80) + '…' })

  const rendered = finalRenderedTitle(metaTitle, title)
  if (rendered.includes(`${BRAND_SUFFIX}${BRAND_SUFFIX}`))
    warnings.push({ url, rule: 'duplicate-brand-suffix', value: rendered })

  if (metaTitle) {
    const k = metaTitle.toLowerCase()
    if (metaTitles.has(k)) warnings.push({ url, rule: 'duplicate-metaTitle', value: metaTitle, other: metaTitles.get(k) })
    else metaTitles.set(k, url)
  }
  if (description) {
    const k = description.toLowerCase()
    if (descriptions.has(k)) warnings.push({ url, rule: 'duplicate-description', value: description.slice(0, 60), other: descriptions.get(k) })
    else descriptions.set(k, url)
  }
}

const total = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).length
console.log(`\nSEO validate: ${total} blog posts`)
console.log(`Warnings: ${warnings.length}\n`)

if (warnings.length) {
  for (const w of warnings) {
    console.log(`[${w.rule}] ${w.url}`)
    console.log(`  ${w.value}${w.other ? ` (dup of ${w.other})` : ''}\n`)
  }
  process.exit(1)
}

console.log('All blog metadata passed validation checks.')
