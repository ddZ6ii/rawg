import * as z from 'zod/mini'

import { type PaginatedResponse } from './paginated-response.schema.js'

const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
})

type Game = z.infer<typeof GameSchema>

type GamesPaginatedResponse = PaginatedResponse<typeof GameSchema>

export { GameSchema, type Game, type GamesPaginatedResponse }
