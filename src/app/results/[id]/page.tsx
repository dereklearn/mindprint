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
        redirectTo: `${window.location.origin}/MindPrint/auth/callback?next=/MindPrint/results/${id}`
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
          <h1 className="text-4xl font-bold text-white mb-6">Your <span className="text-purple-400">MindPrint</span></h1>

          {/* Consolidated type card */}
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 rounded-2xl p-6 border border-purple-700/40 mb-6">
            <div className="text-5xl mb-3">{profile.consolidatedType.icon}</div>
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest mb-1">Your Personality Type</p>
            <h2 className="text-white text-2xl font-bold mb-3">{profile.consolidatedType.name}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{profile.consolidatedType.description}</p>
          </div>

          <p className="text-slate-400 text-sm">{profile.summary}</p>
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
              {/* Archetype header */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${t.color}22`, border: `1px solid ${t.color}55` }}
                >
                  {t.archetypeIcon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: t.color }}>
                    {t.name} · {t.score}%
                  </p>
                  <h3 className="text-white font-bold text-lg leading-tight">{t.archetype}</h3>
                </div>
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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={copyLink}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all text-sm"
          >
            {copied ? '✓ Link copied!' : '🔗 Copy link'}
          </button>
          <button
            onClick={downloadCard}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all text-sm"
          >
            📸 Download card
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

        {/* Social Share Buttons */}
        <div className="mb-6">
          <p className="text-slate-500 text-xs text-center mb-3 uppercase tracking-wide font-medium">Share your MindPrint</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                const text = `I just discovered my personality with MindPrint! My strongest trait is ${profile.traits.reduce((a, b) => a.score > b.score ? a : b).name}. Find out yours 👇`
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
                window.open(url, '_blank')
              }}
              className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-medium py-3 rounded-xl transition-all text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Post on X
            </button>

            <button
              onClick={() => {
                const text = `I just discovered my personality with MindPrint! My strongest trait is ${profile.traits.reduce((a, b) => a.score > b.score ? a : b).name}. Find out yours 👇 ${window.location.href}`
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`
                window.open(url, '_blank')
              }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition-all text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>

            <button
              onClick={() => {
                downloadCard()
                setTimeout(() => {
                  window.open('https://www.instagram.com/', '_blank')
                }, 1500)
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </button>
          </div>
          <p className="text-slate-600 text-xs text-center mt-2">Instagram: card downloads automatically — just upload it to your story</p>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            🏠 Home
          </Link>
          <span className="text-slate-700">·</span>
          <Link href="/quiz" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ↺ Retake the quiz
          </Link>
        </div>
      </div>
    </main>
  )
}
