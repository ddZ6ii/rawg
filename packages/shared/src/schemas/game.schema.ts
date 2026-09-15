import * as z from 'zod/mini'

import { type PaginatedResponse } from './paginated-response.schema.js'
import { ParentPlatformSchema } from './platform.schema.js'

const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
  background_image: z.nullable(z.url()),
  parent_platforms: z.nullable(
    z.array(z.object({ platform: ParentPlatformSchema })),
  ),
})

type Game = z.infer<typeof GameSchema>

type GamesPaginatedResponse = PaginatedResponse<typeof GameSchema>

export { GameSchema, type Game, type GamesPaginatedResponse }
