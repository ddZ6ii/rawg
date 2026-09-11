import { createContext } from 'react'

import { type Theme } from '@/shared/schemas'

type ThemeContextValue = {
  theme: Theme
  updateTheme: (nextTheme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
