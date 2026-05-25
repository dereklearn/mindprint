import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-6">
          <span className="text-6xl">🧠</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Mind<span className="text-purple-400">Print</span>
        </h1>
        <p className="text-xl text-slate-300 mb-3">
          Discover your unique personality through real-life scenarios.
        </p>
        <p className="text-slate-400 mb-10 max-w-lg mx-auto">
          15 questions. 5 traits. A complete picture of who you are — your strengths,
          your blind spots, and how others experience you.
        </p>
        <Link
          href="/quiz"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
        >
          Start your MindPrint →
        </Link>
        <p className="text-slate-500 text-sm mt-6">Free · 3 minutes · No sign-up required</p>
        <div className="mt-4">
          <Link href="/admin" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
            Admin →
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-5 gap-3">
          {[
            { label: 'Openness', color: 'bg-violet-500' },
            { label: 'Conscientiousness', color: 'bg-emerald-500' },
            { label: 'Extraversion', color: 'bg-blue-500' },
            { label: 'Agreeableness', color: 'bg-orange-500' },
            { label: 'Neuroticism', color: 'bg-amber-500' },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-2">
              <div className={`w-2 h-10 rounded-full ${t.color} opacity-70`} />
              <span className="text-slate-500 text-xs text-center">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}