import type { Genre, Platform } from '@rawg/shared'

export type GameQuery = {
  genre: Genre | null
  platform: Platform | null
}
