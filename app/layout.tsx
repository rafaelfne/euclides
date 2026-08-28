import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Euclides',
  description:
    'Fundamentos de computação para julgar código sem executá-lo. ' +
    'Nada é assumido que não esteja declarado.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&family=Spectral:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
