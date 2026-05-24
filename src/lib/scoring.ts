export type TraitKey = 'O' | 'C' | 'E' | 'A' | 'N'

export interface TraitResult {
  key: TraitKey
  name: string
  score: number
  color: string
  strength: string
  weakness: string
  vulnerability: string
}

export interface ProfileResult {
  traits: TraitResult[]
  summary: string
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
  const insights: Record<TraitKey, { strength: string; weakness: string; vulnerability: string }[]> = {
    O: [
      { strength: 'You are stable, practical and consistent — people trust your judgment.', weakness: 'You may resist change even when it would benefit you.', vulnerability: 'Others may dismiss your ideas as outdated or unimaginative.' },
      { strength: 'You balance creativity with practicality — a rare and valuable combination.', weakness: 'You can sometimes feel caught between trying something new and sticking to what works.', vulnerability: 'You may go along with others\' ideas without fully committing to your own.' },
      { strength: 'You are curious, imaginative and thrive on new ideas and experiences.', weakness: 'You may start many things but struggle to finish them all.', vulnerability: 'Manipulative people may distract you with novelty to steer you away from your goals.' },
    ],
    C: [
      { strength: 'You are flexible, spontaneous and adapt well to changing situations.', weakness: 'You may struggle to follow through on long-term commitments.', vulnerability: 'Organised people may take advantage of your flexibility by offloading tasks to you.' },
      { strength: 'You are reliably organized when it matters most without being rigid.', weakness: 'You can sometimes let smaller tasks slide until they pile up.', vulnerability: 'People may assume you will handle things without explicitly asking you.' },
      { strength: 'You are highly dependable, organised and goal-oriented — people count on you.', weakness: 'You can be hard on yourself when things do not go to plan, leading to burnout.', vulnerability: 'Unreliable people will quietly let you carry their weight because you always follow through.' },
    ],
    E: [
      { strength: 'You are a deep thinker who listens well and speaks with intention and weight.', weakness: 'You may miss opportunities by not speaking up or putting yourself forward.', vulnerability: 'Louder personalities may take credit for your ideas or talk over you in groups.' },
      { strength: 'You are comfortable in both social and solo settings — a true ambivert.', weakness: 'You may sometimes feel unsure whether you want company or solitude.', vulnerability: 'You can be pulled into social obligations that drain you if you do not set limits.' },
      { strength: 'You are energetic, charismatic and naturally draw people toward you.', weakness: 'You may act impulsively in social situations or talk before fully thinking.', vulnerability: 'You may be influenced by flattery or peer pressure more than you realise.' },
    ],
    A: [
      { strength: 'You are independent, direct and hold your ground under pressure.', weakness: 'You may come across as cold or uncaring even when that is not your intention.', vulnerability: 'People may see you as a competitor rather than a collaborator and exclude you.' },
      { strength: 'You are cooperative and kind but also able to assert yourself when needed.', weakness: 'You can sometimes feel torn between keeping the peace and standing your ground.', vulnerability: 'You may give in to avoid conflict just slightly more than is healthy for you.' },
      { strength: 'You are warm, empathetic and genuinely care about the people around you.', weakness: 'You may sacrifice your own needs too often to keep others happy.', vulnerability: 'Self-centred people will repeatedly ask more of you knowing you rarely say no.' },
    ],
    N: [
      { strength: 'You are emotionally stable, calm under pressure and rarely rattled by setbacks.', weakness: 'You may sometimes come across as detached or not taking things seriously enough.', vulnerability: 'Others may underestimate how much you actually care about things.' },
      { strength: 'You handle most stress well and recover from setbacks at a healthy pace.', weakness: 'Occasionally a difficult period can hit harder than you expect.', vulnerability: 'People may lean on your stability without checking in on how you are actually doing.' },
      { strength: 'You feel things deeply and have a rich emotional inner world.', weakness: 'Stress and worry can linger far longer than necessary and affect your sleep and focus.', vulnerability: 'Dismissive people may use your emotional sensitivity to make you doubt your own reactions.' },
    ],
  }
  const index = low ? 0 : mid ? 1 : 2
  return insights[trait][index]
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

  return { traits, summary }
}