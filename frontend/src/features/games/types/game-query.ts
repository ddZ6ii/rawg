import type { Genre, GamesSortOrders, Platform } from '@rawg/shared'

export type GameQuery = {
  genre: Genre | null
  platform: Platform | null
  ordering: GamesSortOrders | null
}
