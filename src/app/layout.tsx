import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://neuralforge-labs.com'),
  title: 'MindPrint — Discover Your Personality',
  description: 'Take the MindPrint Big Five personality quiz and discover your unique traits.',
  openGraph: {
    title: 'MindPrint — Discover Your Personality',
    description: 'Discover your Big Five personality traits with real-life scenarios.',
    type: 'website',
    siteName: 'MindPrint',
    images: [{
      url: 'https://neuralforge-labs.com/MindPrint/api/og',
      width: 1200,
      height: 630,
      alt: 'MindPrint — Discover Your Personality',
    }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}