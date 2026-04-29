// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import Footer from '@/components/Footer'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  // The redesigned home page owns its own layout (dark default + footer).
  // Other routes (dashboard, sign-in, etc.) keep the old chrome.
  const isHome = router.pathname === '/'

  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        elements: {
          card: 'min-h-[400px]',
          headerTitle: 'text-xl font-semibold',
          headerSubtitle: 'text-sm text-gray-600',
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <Component {...pageProps} />
        {!isHome && <Footer />}
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default MyApp
