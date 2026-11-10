import type { Metadata } from 'next'
import '@xyflow/react/dist/style.css'
import './globals.css'

/**
 * O endereço público, para o cartão de compartilhamento. Sem ele o Next escreve
 * `http://localhost:3000/og-card.png` no `og:image`, e o LinkedIn e o WhatsApp
 * não acham a imagem. `SITE_URL` sobrescreve; o Railway expõe o domínio no build.
 */
const siteUrl =
  process.env.SITE_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'https://euclides-production.up.railway.app')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Euclides',
  description:
    'Fundamentos de computação para julgar código sem executá-lo. ' +
    'Nada é assumido que não esteja declarado.',
  openGraph: {
    title: 'Euclides: fundamentos de computação',
    description: 'Uma trilha para julgar código gerado por IA sem executá-lo.',
    type: 'website',
    siteName: 'Euclides',
    locale: 'pt_BR',
    images: [
      {
        url: '/og-card.png',
        width: 1200,
        height: 630,
        alt: 'Euclides. Leia o que o código promete: fundamentos de computação para julgar código gerado por IA sem executá-lo.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Euclides: fundamentos de computação',
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
