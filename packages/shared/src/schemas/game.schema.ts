import * as z from 'zod/mini'

import { type PaginatedResponse } from './paginated-response.schema.js'
import { PlatformSchema } from './platform.schema.js'

const GAMES_SORT_ORDERS = [
  'added',
  'metacritic',
  'name',
  'rating',
  'released',
] as const

const GAMES_SORT_ORDERS_WITH_DIRECTION = GAMES_SORT_ORDERS.flatMap(
  (value) => [value, `-${value}`] as const,
)

const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
  // RAWG sometimes returns "" instead of null; accept both and normalize to null
  background_image: z.pipe(
    z.nullable(z.union([z.url(), z.literal('')])),
    z.transform((v) => (v === '' ? null : v)),
  ),
  metacritic: z.nullable(z.number()),
  parent_platforms: z.nullable(z.array(z.object({ platform: PlatformSchema }))),
})

const GamesSortOrdersSchema = z.literal(GAMES_SORT_ORDERS_WITH_DIRECTION)

const GamesParamsSchema = z.object({
  genres: z.optional(z.string()),
  parent_platforms: z.optional(z.string()),
  ordering: z.optional(GamesSortOrdersSchema),
})

type Game = z.infer<typeof GameSchema>
type GamesSortOrders = z.infer<typeof GamesSortOrdersSchema>
type GamesPaginatedResponse = PaginatedResponse<typeof GameSchema>
type GamesParams = z.infer<typeof GamesParamsSchema>

export {
  GAMES_SORT_ORDERS,
  GamesSortOrdersSchema,
  GamesParamsSchema,
  GameSchema,
  type Game,
  type GamesPaginatedResponse,
  type GamesParams,
  type GamesSortOrders,
}
