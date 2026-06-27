import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔥</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1 }}>
          MyCVRoast.in
        </div>
        <div style={{ fontSize: 36, color: '#FF4500', marginTop: 16, fontWeight: 700 }}>
          Tera Resume Ek Mazaak Hai.
        </div>
        <div style={{ fontSize: 22, color: '#444444', marginTop: 24 }}>
          Free AI resume roaster in Hinglish · No signup
        </div>
        <div
          style={{
            marginTop: 40,
            background: '#FF4500',
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
    { width: 1200, height: 630 }
  )
}
