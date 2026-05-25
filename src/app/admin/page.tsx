'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Stats {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
  avgOpenness: number
  avgConscientiousness: number
  avgExtraversion: number
  avgAgreeableness: number
  avgNeuroticism: number
}

interface RecentResult {
  id: string
  created_at: string
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentResult[]>([])
  const [signingIn, setSigningIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (!user) { setLoading(false); return }

    const { data: adminRecord } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (adminRecord) {
      setAuthorized(true)
      await loadStats()
    }
    setLoading(false)
  }

  async function loadStats() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: all } = await supabase.from('results').select('*').order('created_at', { ascending: false })
    const { count: todayCount } = await supabase.from('results').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay)
    const { count: weekCount } = await supabase.from('results').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek)
    const { count: monthCount } = await supabase.from('results').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth)

    if (all && all.length > 0) {
      const avg = (key: string) => Math.round(all.reduce((sum: number, r: any) => sum + r[key], 0) / all.length)
      setStats({
        total: all.length,
        today: todayCount ?? 0,
        thisWeek: weekCount ?? 0,
        thisMonth: monthCount ?? 0,
        avgOpenness: avg('openness'),
        avgConscientiousness: avg('conscientiousness'),
        avgExtraversion: avg('extraversion'),
        avgAgreeableness: avg('agreeableness'),
        avgNeuroticism: avg('neuroticism'),
      })
      setRecent(all.slice(0, 10))
    } else {
      setStats({ total: 0, today: 0, thisWeek: 0, thisMonth: 0, avgOpenness: 0, avgConscientiousness: 0, avgExtraversion: 0, avgAgreeableness: 0, avgNeuroticism: 0 })
    }
  }

  async function handleSignIn() {
    setSigningIn(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` }
    })
  }

  const traitColors: Record<string, string> = {
    Openness: '#7F77DD',
    Conscientiousness: '#1D9E75',
    Extraversion: '#378ADD',
    Agreeableness: '#D85A30',
    Neuroticism: '#BA7517',
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Loading...</div>
    </div>
  )

  if (!user) return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800/60 rounded-3xl p-10 border border-slate-700/50 text-center max-w-md w-full">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
        <p className="text-slate-400 mb-8">Sign in with your approved Google account to access the MindPrint dashboard.</p>
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {signingIn ? 'Redirecting...' : 'Sign in with Google'}
        </button>
      </div>
    </main>
  )

  if (!authorized) return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">Your account is not approved for admin access.</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
          className="text-slate-500 hover:text-white text-sm transition-colors">
          ← Back to MindPrint
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">🧠 MindPrint Admin</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sign out →
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Quizzes', value: stats?.total ?? 0, icon: '📊' },
            { label: 'Today', value: stats?.today ?? 0, icon: '📅' },
            { label: 'This Week', value: stats?.thisWeek ?? 0, icon: '📈' },
            { label: 'This Month', value: stats?.thisMonth ?? 0, icon: '🗓️' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Average trait scores */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 mb-8">
          <h2 className="text-white font-semibold text-lg mb-5">Average Trait Scores Across All Users</h2>
          {stats && [
            { name: 'Openness', value: stats.avgOpenness },
            { name: 'Conscientiousness', value: stats.avgConscientiousness },
            { name: 'Extraversion', value: stats.avgExtraversion },
            { name: 'Agreeableness', value: stats.avgAgreeableness },
            { name: 'Neuroticism', value: stats.avgNeuroticism },
          ].map((t) => (
            <div key={t.name} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300 text-sm">{t.name}</span>
                <span className="text-slate-400 text-sm">{t.value}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${t.value}%`, backgroundColor: traitColors[t.name] }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recent results */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-white font-semibold text-lg mb-5">Recent Results</h2>
          {recent.length === 0 ? (
            <p className="text-slate-400 text-sm">No results yet — share your site to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-center pb-3 font-medium">O</th>
                    <th className="text-center pb-3 font-medium">C</th>
                    <th className="text-center pb-3 font-medium">E</th>
                    <th className="text-center pb-3 font-medium">A</th>
                    <th className="text-center pb-3 font-medium">N</th>
                    <th className="text-left pb-3 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 text-slate-300">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-center text-violet-400 font-medium">{r.openness}%</td>
                      <td className="py-3 text-center text-emerald-400 font-medium">{r.conscientiousness}%</td>
                      <td className="py-3 text-center text-blue-400 font-medium">{r.extraversion}%</td>
                      <td className="py-3 text-center text-orange-400 font-medium">{r.agreeableness}%</td>
                      <td className="py-3 text-center text-amber-400 font-medium">{r.neuroticism}%</td>
                      <td className="py-3">
                        <a href={`/results/${r.id}`} target="_blank"
                          className="text-purple-400 hover:text-purple-300 transition-colors">
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}