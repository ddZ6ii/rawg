import * as z from 'zod/mini'

const THEMES = ['dark', 'light'] as const

const ThemeSchema = z.enum(THEMES)

type Theme = z.infer<typeof ThemeSchema>

export { ThemeSchema, type Theme }
