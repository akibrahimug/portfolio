import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en' suppressHydrationWarning>
      <Head>
        {/* Icon set: Google Search requires a square favicon ≥48px (multiple of 48). */}
        <link rel='icon' href='/favicon.ico' sizes='48x48' />
        <link rel='icon' type='image/png' sizes='48x48' href='/icons/favicon-48.png' />
        <link rel='icon' type='image/png' sizes='192x192' href='/icons/favicon-192.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='theme-color' media='(prefers-color-scheme: light)' content='#fbf9f4' />
        <meta name='theme-color' media='(prefers-color-scheme: dark)' content='#252320' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
