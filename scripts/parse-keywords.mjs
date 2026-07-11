#!/usr/bin/env node
/**
 * Reads MyCVRoast_Keyword_Plan.xlsx → data/keywords.json
 * Run: node scripts/parse-keywords.mjs
 */
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

const ROOT = process.cwd()
const XLSX_PATH = path.join(ROOT, 'MyCVRoast_Keyword_Plan.xlsx')
const OUT_PATH = path.join(ROOT, 'data/keywords.json')

if (!fs.existsSync(XLSX_PATH)) {
  console.error('Missing:', XLSX_PATH)
  process.exit(1)
}

const wb = XLSX.readFile(XLSX_PATH)
const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'keywords') ?? wb.SheetNames[0]
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' })

const keywords = rows.map((row, i) => {
  const r = /** @type {Record<string, string>} */ (row)
  const get = (...keys) => {
    for (const k of keys) {
      if (r[k] !== undefined && r[k] !== '') return String(r[k]).trim()
    }
    const lower = Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase().trim(), v]))
    for (const k of keys) {
      if (lower[k.toLowerCase()] !== undefined && lower[k.toLowerCase()] !== '') {
        return String(lower[k.toLowerCase()]).trim()
      }
    }
    return ''
  }
  return {
    keyword: get('Keyword', 'keyword'),
    cluster: get('Cluster', 'cluster'),
    intent: get('Intent', 'intent'),
    pageType: get('Page Type', 'Page type', 'page type', 'pageType'),
    priority: get('Priority', 'priority').toUpperCase() || 'P2',
    notes: get('Notes', 'notes'),
    row: i + 2,
  }
}).filter((k) => k.keyword)

const grouped = {}
for (const k of keywords) {
  const pt = k.pageType || 'Unknown'
  if (!grouped[pt]) grouped[pt] = { P0: [], P1: [], P2: [], Unknown: [] }
  const pri = ['P0', 'P1', 'P2'].includes(k.priority) ? k.priority : 'Unknown'
  grouped[pt][pri].push(k)
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), sheet: sheetName, total: keywords.length, grouped, all: keywords }, null, 2))

console.log(`Sheet: "${sheetName}" | Total keywords: ${keywords.length}\n`)
console.log('── By Page Type × Priority ──')
for (const [pageType, priMap] of Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]))) {
  const p0 = priMap.P0?.length ?? 0
  const p1 = priMap.P1?.length ?? 0
  const p2 = priMap.P2?.length ?? 0
  const unk = priMap.Unknown?.length ?? 0
  console.log(`${pageType}: P0=${p0} P1=${p1} P2=${p2}${unk ? ` ?=${unk}` : ''} → total=${p0 + p1 + p2 + unk}`)
}

console.log('\n── By Cluster (top 20) ──')
const byCluster = {}
for (const k of keywords) {
  byCluster[k.cluster || 'Unknown'] = (byCluster[k.cluster || 'Unknown'] ?? 0) + 1
}
Object.entries(byCluster)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([c, n]) => console.log(`  ${c}: ${n}`))

console.log('\n── By Priority ──')
const byPri = { P0: 0, P1: 0, P2: 0 }
for (const k of keywords) {
  if (byPri[k.priority] !== undefined) byPri[k.priority]++
  else byPri.P2++
}
console.log(`  P0=${byPri.P0} P1=${byPri.P1} P2=${byPri.P2}`)

console.log(`\nWrote ${OUT_PATH}`)
