import { ImageResponse } from 'next/og'

export const alt = 'MindPrint — Discover Your Personality'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #2e1065 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 90, marginBottom: 24 }}>🧠</div>
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
          <span>Mind</span><span style={{ color: '#a78bfa' }}>Print</span>
        </div>
        <div style={{ fontSize: 30, color: '#94a3b8', textAlign: 'center', maxWidth: 740, lineHeight: 1.4 }}>
          Discover your unique personality through real-life scenarios
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 22,
            color: '#a78bfa',
            background: 'rgba(124, 58, 237, 0.2)',
            padding: '14px 40px',
            borderRadius: 50,
            border: '1px solid rgba(167, 139, 250, 0.4)',
          }}
        >
          15 questions · 5 traits · Free
        </div>
      </div>
    ),
    { ...size }
  )
}
