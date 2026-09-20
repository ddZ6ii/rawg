import * as z from 'zod/mini'

import { type PaginatedResponse } from './paginated-response.schema.js'

const PlatformSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

const PlatformsParamsSchema = z.object({
  ordering: z.optional(z.string()),
})

type Platform = z.infer<typeof PlatformSchema>
type PlatformsPaginatedResponse = PaginatedResponse<typeof PlatformSchema>
type PlatformsParams = z.infer<typeof PlatformsParamsSchema>

export {
  PlatformSchema,
  PlatformsParamsSchema,
  type Platform,
  type PlatformsPaginatedResponse,
  type PlatformsParams,
}
