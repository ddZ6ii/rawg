import * as z from 'zod/mini'

const THEMES = ['dark', 'light', 'system'] as const

const ThemeSchema = z._default(z.enum(THEMES), 'system')

type Theme = z.infer<typeof ThemeSchema>

export { ThemeSchema, THEMES, type Theme }
