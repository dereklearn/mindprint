export type TraitKey = 'O' | 'C' | 'E' | 'A' | 'N'

export interface TraitResult {
  key: TraitKey
  name: string
  score: number
  color: string
  archetype: string
  archetypeIcon: string
  strength: string
  weakness: string
  vulnerability: string
}

export interface ConsolidatedType {
  name: string
  icon: string
  description: string
}

export interface ProfileResult {
  traits: TraitResult[]
  summary: string
  consolidatedType: ConsolidatedType
}

const traitMeta: Record<TraitKey, { name: string; color: string }> = {
  O: { name: 'Openness', color: '#7F77DD' },
  C: { name: 'Conscientiousness', color: '#1D9E75' },
  E: { name: 'Extraversion', color: '#378ADD' },
  A: { name: 'Agreeableness', color: '#D85A30' },
  N: { name: 'Neuroticism', color: '#BA7517' },
}

function getInsight(trait: TraitKey, score: number) {
  const low = score < 38
  const mid = score >= 38 && score < 65
  const insights: Record<TraitKey, { archetype: string; archetypeIcon: string; strength: string; weakness: string; vulnerability: string }[]> = {
    O: [
      { archetype: 'The Traditionalist', archetypeIcon: '🏡', strength: 'You are stable, practical and consistent — people trust your judgment.', weakness: 'You may resist change even when it would benefit you.', vulnerability: 'Others may dismiss your ideas as outdated or unimaginative.' },
      { archetype: 'The Pragmatist', archetypeIcon: '🧭', strength: 'You balance creativity with practicality — a rare and valuable combination.', weakness: 'You can sometimes feel caught between trying something new and sticking to what works.', vulnerability: 'You may go along with others\' ideas without fully committing to your own.' },
      { archetype: 'The Scientist', archetypeIcon: '🔬', strength: 'You are curious, imaginative and thrive on new ideas and experiences.', weakness: 'You may start many things but struggle to finish them all.', vulnerability: 'Manipulative people may distract you with novelty to steer you away from your goals.' },
    ],
    C: [
      { archetype: 'The Free Spirit', archetypeIcon: '🌊', strength: 'You are flexible, spontaneous and adapt well to changing situations.', weakness: 'You may struggle to follow through on long-term commitments.', vulnerability: 'Organised people may take advantage of your flexibility by offloading tasks to you.' },
      { archetype: 'The Balancer', archetypeIcon: '⚖️', strength: 'You are reliably organized when it matters most without being rigid.', weakness: 'You can sometimes let smaller tasks slide until they pile up.', vulnerability: 'People may assume you will handle things without explicitly asking you.' },
      { archetype: 'The Architect', archetypeIcon: '🏗️', strength: 'You are highly dependable, organised and goal-oriented — people count on you.', weakness: 'You can be hard on yourself when things do not go to plan, leading to burnout.', vulnerability: 'Unreliable people will quietly let you carry their weight because you always follow through.' },
    ],
    E: [
      { archetype: 'The Sage', archetypeIcon: '🦉', strength: 'You are a deep thinker who listens well and speaks with intention and weight.', weakness: 'You may miss opportunities by not speaking up or putting yourself forward.', vulnerability: 'Louder personalities may take credit for your ideas or talk over you in groups.' },
      { archetype: 'The Diplomat', archetypeIcon: '🌉', strength: 'You are comfortable in both social and solo settings — a true ambivert.', weakness: 'You may sometimes feel unsure whether you want company or solitude.', vulnerability: 'You can be pulled into social obligations that drain you if you do not set limits.' },
      { archetype: 'The Leader', archetypeIcon: '⚡', strength: 'You are energetic, charismatic and naturally draw people toward you.', weakness: 'You may act impulsively in social situations or talk before fully thinking.', vulnerability: 'You may be influenced by flattery or peer pressure more than you realise.' },
    ],
    A: [
      { archetype: 'The Strategist', archetypeIcon: '🦁', strength: 'You are independent, direct and hold your ground under pressure.', weakness: 'You may come across as cold or uncaring even when that is not your intention.', vulnerability: 'People may see you as a competitor rather than a collaborator and exclude you.' },
      { archetype: 'The Peacemaker', archetypeIcon: '🤝', strength: 'You are cooperative and kind but also able to assert yourself when needed.', weakness: 'You can sometimes feel torn between keeping the peace and standing your ground.', vulnerability: 'You may give in to avoid conflict just slightly more than is healthy for you.' },
      { archetype: 'The Caregiver', archetypeIcon: '💝', strength: 'You are warm, empathetic and genuinely care about the people around you.', weakness: 'You may sacrifice your own needs too often to keep others happy.', vulnerability: 'Self-centred people will repeatedly ask more of you knowing you rarely say no.' },
    ],
    N: [
      { archetype: 'The Stoic', archetypeIcon: '🗿', strength: 'You are emotionally stable, calm under pressure and rarely rattled by setbacks.', weakness: 'You may sometimes come across as detached or not taking things seriously enough.', vulnerability: 'Others may underestimate how much you actually care about things.' },
      { archetype: 'The Realist', archetypeIcon: '🌤️', strength: 'You handle most stress well and recover from setbacks at a healthy pace.', weakness: 'Occasionally a difficult period can hit harder than you expect.', vulnerability: 'People may lean on your stability without checking in on how you are actually doing.' },
      { archetype: 'The Empath', archetypeIcon: '🌊', strength: 'You feel things deeply and have a rich emotional inner world.', weakness: 'Stress and worry can linger far longer than necessary and affect your sleep and focus.', vulnerability: 'Dismissive people may use your emotional sensitivity to make you doubt your own reactions.' },
    ],
  }
  const index = low ? 0 : mid ? 1 : 2
  return insights[trait][index]
}

const consolidatedTypes: Record<string, ConsolidatedType> = {
  'O+C': { name: 'The Methodical Innovator', icon: '🧪', description: 'You combine a hunger for new ideas with the discipline to actually bring them to life. Where others dream, you build.' },
  'O+E': { name: 'The Creative Visionary', icon: '🎨', description: 'You light up rooms with fresh thinking and infectious energy. Your imagination inspires others to see what is possible.' },
  'O+A': { name: 'The Empathetic Explorer', icon: '🌍', description: 'You explore ideas with an open heart — curious about the world and genuinely invested in the people within it.' },
  'O+N': { name: 'The Introspective Dreamer', icon: '🌌', description: 'Your rich inner world fuels deep creativity. You feel ideas as much as you think them, giving your work rare emotional depth.' },
  'C+O': { name: 'The Strategic Inventor', icon: '⚙️', description: 'You bring structure to bold ideas. Where others see chaos, you see a system waiting to be built — and you build it.' },
  'C+E': { name: 'The Driven Leader', icon: '🎯', description: 'You set the direction and keep the team moving. Organised, energetic and focused, you make things happen.' },
  'C+A': { name: 'The Devoted Builder', icon: '🏛️', description: 'You build lasting things — relationships, systems, communities — with care and quiet determination.' },
  'C+N': { name: 'The Vigilant Planner', icon: '📊', description: 'You plan ahead because you feel the weight of what could go wrong. That awareness, channelled well, makes you exceptionally prepared.' },
  'E+O': { name: 'The Inspiring Adventurer', icon: '✨', description: 'You chase new experiences and bring others along for the ride. Spontaneous, expressive and endlessly curious.' },
  'E+C': { name: 'The Organised Connector', icon: '🌐', description: 'You bring people together with intention. Social, structured and reliable — you are the person who actually follows through.' },
  'E+A': { name: 'The Magnetic Nurturer', icon: '🌟', description: 'You draw people in and make them feel genuinely seen. Warm, expressive and deeply caring about those around you.' },
  'E+N': { name: 'The Passionate Advocate', icon: '🔥', description: 'You feel things intensely and speak up for what matters. Your emotional depth gives your voice real power.' },
  'A+O': { name: 'The Compassionate Visionary', icon: '🌸', description: 'You imagine a better world and care deeply about making it real for the people around you.' },
  'A+C': { name: 'The Reliable Guardian', icon: '🛡️', description: 'People know they can count on you — to show up, to care and to do what you said you would do.' },
  'A+E': { name: 'The Social Harmoniser', icon: '🤝', description: 'You are the glue in every group — warm, sociable and gifted at keeping people connected and at ease.' },
  'A+N': { name: 'The Sensitive Mediator', icon: '💫', description: 'You feel the emotional temperature of every room and work gently to keep things balanced and kind.' },
  'N+O': { name: 'The Reflective Artist', icon: '🎭', description: 'Your emotional sensitivity and imagination combine into something rare — a deep, authentic creative voice.' },
  'N+C': { name: 'The Conscientious Worrier', icon: '📋', description: 'You hold yourself to high standards and feel the gap when things fall short. That tension drives remarkable attention to detail.' },
  'N+E': { name: 'The Intense Performer', icon: '🎤', description: 'You live boldly and feel deeply. Life is vivid for you — and that intensity is magnetic to the people around you.' },
  'N+A': { name: 'The Devoted Empath', icon: '💝', description: 'You absorb the feelings of those around you and respond with genuine compassion. Few people make others feel as understood as you do.' },
}

function getConsolidatedType(traits: TraitResult[]): ConsolidatedType {
  const sorted = [...traits].sort((a, b) => b.score - a.score)
  const key = `${sorted[0].key}+${sorted[1].key}`
  return consolidatedTypes[key] ?? {
    name: 'The Unique Mind',
    icon: '🧠',
    description: 'Your personality is a rare and complex blend that defies easy categorisation. That is your greatest strength.',
  }
}

export function calculateProfile(
  answers: number[],
  questions: { trait: string; reverse: boolean }[]
): ProfileResult {
  const scores: Record<TraitKey, number[]> = { O: [], C: [], E: [], A: [], N: [] }

  questions.forEach((q, i) => {
    let val = answers[i]
    if (q.reverse) val = 4 - val
    scores[q.trait as TraitKey].push(val)
  })

  const traits: TraitResult[] = (Object.keys(scores) as TraitKey[]).map((key) => {
    const arr = scores[key]
    const pct = Math.round((arr.reduce((a, b) => a + b, 0) / (arr.length * 4)) * 100)
    const insight = getInsight(key, pct)
    return {
      key,
      name: traitMeta[key].name,
      score: pct,
      color: traitMeta[key].color,
      ...insight,
    }
  })

  const topTrait = traits.reduce((a, b) => (a.score > b.score ? a : b))
  const summary = `Your strongest trait is ${topTrait.name} at ${topTrait.score}%. You have a unique blend of qualities that define how you see the world and connect with others.`
  const consolidatedType = getConsolidatedType(traits)

  return { traits, summary, consolidatedType }
}