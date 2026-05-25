'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { calculateProfile, ProfileResult } from '@/lib/scoring'
import { toPng } from 'html-to-image'

export default function ResultsPage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<ProfileResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: result } = await supabase
        .from('results')
        .select('*')
        .eq('id', id)
        .single()

      const { data: questions } = await supabase
        .from('questions')
        .select('trait, reverse')
        .order('display_order')

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (result && questions) {
        const profile = calculateProfile(result.answers, questions)
        setProfile(profile)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
  setSaving(true)
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/results/${id}`
    }
  })
  setSaving(false)
}

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadCard() {
    if (!cardRef.current) return
    const disabledSheets: CSSStyleSheet[] = []
    try {
      // Disable cross-origin stylesheets before capture to avoid SecurityError
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          sheet.cssRules
        } catch {
          sheet.disabled = true
          disabledSheets.push(sheet)
        }
      })

      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#1e1b4b',
        pixelRatio: 2,
        skipFonts: true,
      })

      const link = document.createElement('a')
      link.download = 'my-mindprint.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
      alert('Could not generate image — try taking a screenshot instead.')
    } finally {
      disabledSheets.forEach(sheet => (sheet.disabled = false))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Building your MindPrint...</div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Result not found.</div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Your <span className="text-purple-400">MindPrint</span></h1>
          <p className="text-slate-400">{profile.summary}</p>
        </div>

        {/* Shareable card */}
        <div ref={cardRef} className="bg-gradient-to-br from-purple-950 to-slate-900 rounded-3xl p-8 border border-purple-800/40 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🧠</span>
            <div>
              <div className="text-white font-bold text-xl">MindPrint</div>
              <div className="text-slate-400 text-sm">My Personality Profile</div>
            </div>
          </div>

          {profile.traits.map((t) => (
            <div key={t.key} className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-white font-medium text-sm">{t.name}</span>
                <span className="text-slate-400 text-sm">{t.score}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${t.score}%`, backgroundColor: t.color }}
                />
              </div>
            </div>
          ))}

          <div className="mt-4 text-slate-500 text-xs text-right">mindprint.app</div>
        </div>

        {/* Deep insights */}
        <div className="space-y-4 mb-8">
          {profile.traits.map((t) => (
            <div key={t.key} className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <h3 className="text-white font-semibold">{t.name} — {t.score}%</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Strength</span>
                  <p className="text-slate-300 text-sm mt-1">{t.strength}</p>
                </div>
                <div>
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Weakness</span>
                  <p className="text-slate-300 text-sm mt-1">{t.weakness}</p>
                </div>
                <div>
                  <span className="text-rose-400 text-xs font-semibold uppercase tracking-wide">Watch out for</span>
                  <p className="text-slate-300 text-sm mt-1">{t.vulnerability}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={copyLink}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all text-sm"
          >
            {copied ? '✓ Link copied!' : '🔗 Copy shareable link'}
          </button>
          <button
            onClick={downloadCard}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all text-sm"
          >
            📸 Download image card
          </button>
          {!user && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-all text-sm"
            >
              {saving ? 'Redirecting...' : '💾 Save with Google'}
            </button>
          )}
        </div>

        <div className="text-center">
          <Link href="/quiz" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ↺ Retake the quiz
          </Link>
        </div>
      </div>
    </main>
  )
}