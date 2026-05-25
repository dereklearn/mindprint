import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { calculateProfile } from '@/lib/scoring'

export const alt = 'My MindPrint Personality Results'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: result } = await supabase.from('results').select('*').eq('id', id).single()
  const { data: questions } = await supabase.from('questions').select('trait, reverse').order('display_order')

  let typeName = 'The Unique Mind'
  let typeIcon = '🧠'
  let traits: { name: string; score: number; color: string }[] = []

  if (result && questions) {
    const profile = calculateProfile(result.answers, questions)
    typeName = profile.consolidatedType.name
    typeIcon = profile.consolidatedType.icon
    traits = profile.traits
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #2e1065 60%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 36, marginRight: 14 }}>🧠</span>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 'bold', color: 'white' }}>
            <span>Mind</span><span style={{ color: '#a78bfa' }}>Print</span>
          </div>
        </div>

        {/* Personality type */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 22, color: '#a78bfa', marginBottom: 12, letterSpacing: 6, textTransform: 'uppercase' }}>
            Personality Type
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            <span style={{ fontSize: 72 }}>{typeIcon}</span>
            <span style={{ fontSize: 58, fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>{typeName}</span>
          </div>

          {/* Trait bars */}
          {traits.length > 0 && (
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginTop: 16 }}>
              {traits.map((t) => (
                <div key={t.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{t.score}%</span>
                  <div
                    style={{
                      width: 140,
                      height: 16,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${t.score}%`,
                        background: t.color,
                        borderRadius: 8,
                      }}
                    />
                  </div>
                  <span style={{ color: '#64748b', fontSize: 18 }}>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ color: '#475569', fontSize: 20, marginTop: 32 }}>
          neuralforge-labs.com/MindPrint — Take yours free
        </div>
      </div>
    ),
    { ...size }
  )
}
