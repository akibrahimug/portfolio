// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import Footer from '@/components/Footer'
import { motion, useScroll, useReducedMotion } from 'framer-motion'

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      className='fixed top-0 left-0 right-0 h-[2px] bg-brand-500 z-50'
      aria-hidden
    />
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        // Optimize Clerk loading
        elements: {
          // Minimize layout shifts by setting consistent dimensions
          card: 'min-h-[400px]',
          headerTitle: 'text-xl font-semibold',
          headerSubtitle: 'text-sm text-gray-600',
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ScrollProgress />
        <Component {...pageProps} />
        <Footer />
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default MyApp
