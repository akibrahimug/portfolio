// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'

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
        <Component {...pageProps} />
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default MyApp
