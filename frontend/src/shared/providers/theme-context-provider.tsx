import { useCallback, useEffect, useMemo, useState } from 'react'

import { ThemeContext } from '@/shared/contexts'
import type { Theme } from '@/shared/schemas'
import { getSavedPreferences } from '@/shared/utilities'

function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeContextProvider({
  children,
  storageKey = 'rawg-app',
}: React.PropsWithChildren & {
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => getSavedPreferences(storageKey)?.theme ?? initTheme(),
  )

  const updateTheme = useCallback(
    (nextTheme: Theme) => {
      setTheme(nextTheme)
      try {
        localStorage.setItem(storageKey, JSON.stringify({ theme: nextTheme }))
      } catch {
        // storage unavailable: theme still applies for this session
      }
    },
    [storageKey],
  )

  const ctxValue = useMemo(() => ({ theme, updateTheme }), [theme, updateTheme])

  useEffect(() => {
    const htmlEl = document.querySelector('html')
    if (!htmlEl) return

    const isDarkMode = theme === 'dark'

    htmlEl.classList.toggle('dark', isDarkMode)
  }, [theme])

  return <ThemeContext value={ctxValue}>{children}</ThemeContext>
}
