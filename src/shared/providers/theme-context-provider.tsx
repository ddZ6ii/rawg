import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { ThemeContext } from '@/shared/contexts'
import type { Theme } from '@/shared/schemas'
import { getSavedPreferences } from '@/shared/utilities'

const media = window.matchMedia('(prefers-color-scheme: dark)')

function subscribe(callback: () => void) {
  media.addEventListener('change', callback)
  return () => {
    media.removeEventListener('change', callback)
  }
}

function getSystemPrefersDarkSnapshot() {
  return media.matches
}

export function ThemeContextProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'rawg-app',
}: React.PropsWithChildren & {
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => getSavedPreferences(storageKey)?.theme ?? defaultTheme,
  )

  const updateTheme = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme)
  }, [])

  const ctxValue = useMemo(() => ({ theme, updateTheme }), [theme, updateTheme])

  const systemPrefersDark = useSyncExternalStore(
    subscribe,
    getSystemPrefersDarkSnapshot,
  )

  useEffect(() => {
    const htmlEl = document.querySelector('html')
    if (!htmlEl) return

    const isDarkMode =
      theme === 'dark' || (theme === 'system' && systemPrefersDark)

    htmlEl.classList.toggle('dark', isDarkMode)

    localStorage.setItem(storageKey, JSON.stringify({ theme }))
  }, [theme, storageKey, systemPrefersDark])

  return <ThemeContext value={ctxValue}>{children}</ThemeContext>
}
