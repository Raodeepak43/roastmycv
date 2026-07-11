'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💀</p>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
          <p style={{ color: '#888', marginBottom: '1.5rem', maxWidth: '24rem' }}>
            MyCVRoast hit an error. Refresh or go back to the homepage.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#ff4500',
              color: '#000',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
