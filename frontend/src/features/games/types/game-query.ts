import type { Genre, GamesSortOrders, Platform } from '@rawg/shared'

export type GameQuery = {
  genre: Genre | null
  platform: Platform | null
  search: string | null
  ordering: GamesSortOrders | null
}
