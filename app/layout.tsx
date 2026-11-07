import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Newsreader, Hanken_Grotesk } from 'next/font/google'
import '@/styles/globals.css'
import { redesignContent } from '@/lib/redesign-content'
import { SITE_URL, ogImage } from '@/lib/seo'
import { SiteNav } from '@/components/sections/SiteNav'
import { Footer } from '@/components/sections/Footer'
import { AskBar } from '@/components/demo/AskBar'

// Typefaces are wired to tokens (`--font-display`, `--font-sans`) in globals.css.
// Editorial serif display (variable optical size + italic for accent emphasis) over a humanist sans.
const display = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-display-face',
  display: 'swap',
})
const body = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body-face',
  display: 'swap',
})

const { title, description } = redesignContent.meta

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Ibrahim Kasoma',
    locale: 'en_GB',
    url: '/',
    title,
    description,
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage.url],
    creator: '@Akibrahimug',
  },
  // Google Search requires a square favicon ≥48px (multiple of 48).
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
  // Page kind for the taste-skill checker (design-taste-frontend): a technical subject, so one effect is allowed.
  other: { 'page-type': 'software', 'site-kind': 'software' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf9f4',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en-GB' data-type='software' className={`${display.variable} ${body.variable}`}>
      <body className='min-h-screen bg-background font-sans text-foreground antialiased'>
        <noscript>
          <style>{'[data-grow]{width:var(--pct)!important}'}</style>
        </noscript>
        <SiteNav />
        <AskBar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
