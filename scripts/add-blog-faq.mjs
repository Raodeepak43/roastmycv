#!/usr/bin/env node
/**
 * Add faq: frontmatter to blog posts missing it.
 * Run: node scripts/add-blog-faq.mjs
 */
import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function buildFaq(title, description, slug) {
  const topic = title.replace(/\s*\|\s*MyCVRoast.*$/i, '').replace(/\s*\(20\d{2}\)\s*$/, '').trim()
  const short = topic.length > 80 ? topic.slice(0, 77) + '…' : topic

  const items = [
    {
      q: `What is ${short}?`,
      a: description || `${short} — practical guide for Indian job seekers from MyCVRoast.`,
    },
    {
      q: 'Is this guide free to use?',
      a: 'Yes. MyCVRoast blog guides are free. Many linked tools (resume roast, resume builder) have free tiers with no signup required.',
    },
    {
      q: 'How can I get AI feedback on my resume after reading this?',
      a: 'Upload your CV at mycvroast.in for a free AI resume roast — instant score, Hinglish feedback, and specific fixes in under 30 seconds.',
    },
  ]

  if (slug.includes('resume') || slug.includes('cv')) {
    items.push({
      q: 'Does this work for fresher resumes in India?',
      a: 'Yes. MyCVRoast and our guides are built for Indian freshers, campus placement, and off-campus job seekers — CGPA, projects, and ATS context included.',
    })
  }

  return items
}

function faqYaml(faq) {
  const lines = ['faq:']
  for (const { q, a } of faq) {
    lines.push(`  - q: "${q.replace(/"/g, '\\"')}"`)
    lines.push(`    a: "${a.replace(/"/g, '\\"')}"`)
  }
  return lines.join('\n')
}

let updated = 0
for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
  const filePath = path.join(BLOG_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')
  if (/^faq:/m.test(raw)) continue

  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) continue

  const front = match[1]
  const body = match[2]
  const title = (front.match(/^title:\s*"?([^"\n]+)"?/m) || [])[1] || file.replace('.md', '')
  const description = (front.match(/^description:\s*"?([^"\n]+)"?/m) || [])[1] || ''
  const slug = (front.match(/^slug:\s*"?([^"\n]+)"?/m) || [])[1] || file.replace('.md', '')

  const faqBlock = faqYaml(buildFaq(title, description, slug))
  const newFront = front.trimEnd() + '\n' + faqBlock
  fs.writeFileSync(filePath, `---\n${newFront}\n---\n${body}`)
  updated++
}

console.log(`Added FAQ to ${updated} posts.`)
