import { Router, type Router as RouterType } from 'express'
import * as z from 'zod/mini'

import {
  InvalidInputError,
  PaginatedResponseSchema,
  PlatformSchema,
  PlatformsParamsSchema,
  type PlatformsPaginatedResponse,
} from '@rawg/shared'

import { cache } from '../lib/cache.js'
import { rawgClient } from '../lib/rawg-client.js'
import { stripApiKey } from '../utilities/strip-api-key.js'

const router: RouterType = Router()

router.get('/platforms', async (req, res) => {
  const cacheKey = req.originalUrl
  const cached = cache.get(cacheKey)
  if (cached) {
    res.json(cached)
    return
  }

  const parsedQuery = z.safeParse(PlatformsParamsSchema, req.query)
  if (!parsedQuery.success) {
    throw new InvalidInputError(parsedQuery.error, 'Invalid query parameters')
  }

  const { data } = await rawgClient.get<PlatformsPaginatedResponse>(
    '/platforms/lists/parents',
    {
      params: parsedQuery.data,
    },
  )
  const parsed = z.parse(PaginatedResponseSchema(PlatformSchema), data)

  parsed.next = stripApiKey(parsed.next)
  parsed.previous = stripApiKey(parsed.previous)

  cache.set(cacheKey, parsed)

  res.json(parsed)
})

export { router as platformsRouter }
