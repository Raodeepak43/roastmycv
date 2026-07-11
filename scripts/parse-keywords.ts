#!/usr/bin/env node
/**
 * Reads MyCVRoast_Keyword_Plan.xlsx → data/keywords.json
 * Run: npx tsx scripts/parse-keywords.ts
 */
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

const ROOT = process.cwd()
const XLSX_PATH = path.join(ROOT, 'MyCVRoast_Keyword_Plan.xlsx')
const OUT_PATH = path.join(ROOT, 'data/keywords.json')

type KeywordRow = {
  keyword: string
  cluster: string
  intent: string
  pageType: string
  priority: string
  notes: string
  row: number
}

function getCell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return String(row[k]).trim()
  }
  const lower = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]),
  )
  for (const k of keys) {
    const v = lower[k.toLowerCase()]
    if (v !== undefined && v !== '') return String(v).trim()
  }
  return ''
}

if (!fs.existsSync(XLSX_PATH)) {
  console.error('Missing:', XLSX_PATH)
  process.exit(1)
}

const wb = XLSX.readFile(XLSX_PATH)
const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'keywords') ?? wb.SheetNames[0]
const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName], { defval: '' })

const all: KeywordRow[] = rawRows
  .map((row, i) => ({
    keyword: getCell(row, 'Keyword', 'keyword'),
    cluster: getCell(row, 'Cluster', 'cluster'),
    intent: getCell(row, 'Intent', 'intent'),
    pageType: getCell(row, 'Page Type', 'Page type', 'pageType'),
    priority: (getCell(row, 'Priority', 'priority') || 'P2').toUpperCase(),
    notes: getCell(row, 'Notes', 'notes'),
    row: i + 2,
  }))
  .filter((k) => k.keyword)

const grouped: Record<string, Record<string, KeywordRow[]>> = {}
for (const k of all) {
  const pt = k.pageType || 'Unknown'
  if (!grouped[pt]) grouped[pt] = { P0: [], P1: [], P2: [], Unknown: [] }
  const pri = ['P0', 'P1', 'P2'].includes(k.priority) ? k.priority : 'Unknown'
  grouped[pt][pri].push(k)
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(
  OUT_PATH,
  JSON.stringify({ generatedAt: new Date().toISOString(), sheet: sheetName, total: all.length, grouped, all }, null, 2),
)

console.log(`Sheet: "${sheetName}" | Total keywords: ${all.length}\n`)
console.log('── By Page Type × Priority ──')
for (const [pageType, priMap] of Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]))) {
  const p0 = priMap.P0?.length ?? 0
  const p1 = priMap.P1?.length ?? 0
  const p2 = priMap.P2?.length ?? 0
  const unk = priMap.Unknown?.length ?? 0
  console.log(`${pageType}: P0=${p0} P1=${p1} P2=${p2}${unk ? ` ?=${unk}` : ''} → total=${p0 + p1 + p2 + unk}`)
}

console.log(`\nWrote ${OUT_PATH}`)
