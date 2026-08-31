import type { Metadata } from 'next'
import '@xyflow/react/dist/style.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Euclides',
  description:
    'Fundamentos de computação para julgar código sem executá-lo. ' +
    'Nada é assumido que não esteja declarado.',
  openGraph: {
    title: 'Euclides — fundamentos de computação',
    description: 'Uma trilha para julgar código gerado por IA sem executá-lo.',
    type: 'website',
    images: [
      {
        url: '/og-card.png',
        width: 1200,
        height: 630,
        alt: 'Euclides — fundamentos de computação para julgar código gerado por IA sem executá-lo.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Euclides — fundamentos de computação',
    description: 'Uma trilha para julgar código gerado por IA sem executá-lo.',
    images: ['/og-card.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
