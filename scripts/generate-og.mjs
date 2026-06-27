import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../public/og-image.png')

mkdirSync(dirname(outPath), { recursive: true })

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#000000"/>
  <text x="600" y="200" font-size="96" text-anchor="middle" dominant-baseline="middle">🔥</text>
  <text x="600" y="300" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" fill="#FFFFFF" text-anchor="middle">MyCVRoast</text>
  <text x="600" y="380" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#FF4500" text-anchor="middle">AI Roasts Your Resume Brutally</text>
  <text x="600" y="560" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#666666" text-anchor="middle">mycvroast.in</text>
</svg>`

const png = await sharp(Buffer.from(svg)).png().toBuffer()
writeFileSync(outPath, png)
console.log('Created', outPath)
