'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

const ThemeProviderComponent = ({ children, ...props }: ThemeProviderProps) => {
  // Memoize the props to prevent unnecessary re-renders
  const memoizedProps = React.useMemo(
    () => props,
    [
      props.attribute,
      props.defaultTheme,
      props.enableSystem,
      props.disableTransitionOnChange,
      props.storageKey,
      props.themes,
      props.forcedTheme,
      props.value,
      props.nonce,
    ],
  )

  return <NextThemesProvider {...memoizedProps}>{children}</NextThemesProvider>
}

export const ThemeProvider = React.memo(ThemeProviderComponent)
