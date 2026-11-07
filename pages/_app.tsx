// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Syne, Hanken_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'

// Distinctive geometric display with real character; humanist sans for body.
const display = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      <div className={`${display.variable} ${sans.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}
