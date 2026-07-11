import { ImageResponse } from 'next/og'

export const runtime = 'edge'

async function loadSyne(weight: number): Promise<ArrayBuffer> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Syne:wght@${weight}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  }).then((res) => res.text())

  const match = css.match(/src: url\(([^)]+)\) format\('woff2'\)/)
  if (!match?.[1]) {
    throw new Error(`Failed to load Syne weight ${weight}`)
  }

  return fetch(match[1]).then((res) => res.arrayBuffer())
}

export async function GET() {
  const [syne800, syne700] = await Promise.all([loadSyne(800), loadSyne(700)])

  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Syne',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔥</div>
        <div style={{ fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1 }}>
          MyCVRoast.in
        </div>
        <div style={{ fontSize: 36, color: 'var(--color-ember)', marginTop: 16, fontWeight: 700 }}>
          Tera Resume Ek Mazaak Hai.
        </div>
        <div style={{ fontSize: 22, color: '#444444', marginTop: 24, fontWeight: 400 }}>
          Free AI resume roaster in Hinglish · No signup
        </div>
        <div
          style={{
            marginTop: 40,
            background: 'var(--color-ember)',
            color: 'black',
            padding: '12px 32px',
            borderRadius: 8,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Try Free → mycvroast.in
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Syne', data: syne800, weight: 800, style: 'normal' },
        { name: 'Syne', data: syne700, weight: 700, style: 'normal' },
      ],
    },
  )
}
