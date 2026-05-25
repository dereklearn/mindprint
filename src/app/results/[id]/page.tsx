import type { Metadata } from 'next'
import ResultsClient from './ResultsClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'My MindPrint Personality Results',
    openGraph: {
      title: 'My MindPrint Personality Results',
      description: 'See my Big Five personality profile — discover yours free at MindPrint.',
      images: [{
        url: `/MindPrint/results/${id}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'My MindPrint Personality Results',
      }],
    },
  }
}

export default function ResultsPage() {
  return <ResultsClient />
}
