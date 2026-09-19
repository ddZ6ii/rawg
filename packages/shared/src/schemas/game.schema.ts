import * as z from 'zod/mini'

import { type PaginatedResponse } from './paginated-response.schema.js'
import { PlatformSchema } from './platform.schema.js'

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

const GamesParamsSchema = z.object({
  genres: z.optional(z.string()),
})

type Game = z.infer<typeof GameSchema>
type GamesPaginatedResponse = PaginatedResponse<typeof GameSchema>
type GamesParams = z.infer<typeof GamesParamsSchema>

export {
  GameSchema,
  GamesParamsSchema,
  type Game,
  type GamesPaginatedResponse,
  type GamesParams,
}
