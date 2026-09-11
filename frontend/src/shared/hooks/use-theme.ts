import { use } from 'react'

import { ThemeContext } from '@/shared/contexts'

export function useTheme() {
  const ctx = use(ThemeContext)
  if (ctx === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
