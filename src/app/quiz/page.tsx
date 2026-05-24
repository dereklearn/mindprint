'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calculateProfile } from '@/lib/scoring'

interface Question {
  id: number
  trait: string
  scenario: string
  question: string
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  option_5: string
  reverse: boolean
  display_order: number
}

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadQuestions() {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .order('display_order')
      if (data) {
        setQuestions(data)
        setAnswers(new Array(data.length).fill(-1))
      }
      setLoading(false)
    }
    loadQuestions()
  }, [])

  const traitColors: Record<string, string> = {
    O: 'bg-violet-100 text-violet-800',
    C: 'bg-emerald-100 text-emerald-800',
    E: 'bg-blue-100 text-blue-800',
    A: 'bg-orange-100 text-orange-800',
    N: 'bg-amber-100 text-amber-800',
  }

  const traitNames: Record<string, string> = {
    O: 'Openness', C: 'Conscientiousness', E: 'Extraversion',
    A: 'Agreeableness', N: 'Neuroticism',
  }

  async function handleAnswer(optionIndex: number) {
    const newAnswers = [...answers]
    newAnswers[current] = optionIndex
    setAnswers(newAnswers)

    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300)
    }
  }

  async function handleSubmit() {
    setSaving(true)
    const profile = calculateProfile(answers, questions)
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('results').insert({
      user_id: user?.id ?? null,
      openness: profile.traits.find(t => t.key === 'O')?.score,
      conscientiousness: profile.traits.find(t => t.key === 'C')?.score,
      extraversion: profile.traits.find(t => t.key === 'E')?.score,
      agreeableness: profile.traits.find(t => t.key === 'A')?.score,
      neuroticism: profile.traits.find(t => t.key === 'N')?.score,
      answers: answers,
    }).select().single()

    if (data) router.push(`/results/${data.id}`)
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Loading your questions...</div>
    </div>
  )

  const q = questions[current]
  const opts = [q.option_1, q.option_2, q.option_3, q.option_4, q.option_5]
  const progress = Math.round(((current + 1) / questions.length) * 100)
  const allAnswered = answers.every(a => a !== -1)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm font-medium">
            Question {current + 1} of {questions.length}
          </span>
          <span className="text-slate-400 text-sm">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mb-8">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-slate-800/60 backdrop-blur rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 ${traitColors[q.trait]}`}>
            {traitNames[q.trait]}
          </span>

          <div className="bg-slate-700/50 rounded-2xl p-5 mb-6 border border-slate-600/30">
            <p className="text-slate-300 text-sm leading-relaxed">{q.scenario}</p>
          </div>

          <p className="text-white font-semibold text-lg mb-6">{q.question}</p>

          <div className="flex flex-col gap-3">
            {opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`text-left px-5 py-4 rounded-xl border text-sm transition-all duration-150 ${
                  answers[current] === i
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/60'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="text-slate-400 hover:text-white disabled:opacity-30 text-sm transition-colors"
            >
              ← Back
            </button>

            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(current + 1)}
                disabled={answers[current] === -1}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-sm px-6 py-2.5 rounded-xl transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || saving}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-semibold px-8 py-2.5 rounded-xl transition-all"
              >
                {saving ? 'Saving...' : 'See my MindPrint →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}