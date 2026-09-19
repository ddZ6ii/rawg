import * as z from 'zod/mini'

import { type PaginatedResponse } from './paginated-response.schema.js'

const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
  // RAWG sometimes returns "" instead of null; accept both and normalize to null
  image_background: z.pipe(
    z.nullable(z.union([z.url(), z.literal('')])),
    z.transform((v) => (v === '' ? null : v)),
  ),
})

const GenresParamsSchema = z.object({
  ordering: z.optional(z.string()),
})

type Genre = z.infer<typeof GenreSchema>
type GenresPaginatedResponse = PaginatedResponse<typeof GenreSchema>
type GenresParams = z.infer<typeof GenresParamsSchema>

export {
  GenreSchema,
  GenresParamsSchema,
  type Genre,
  type GenresPaginatedResponse,
  type GenresParams,
}
