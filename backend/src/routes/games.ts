import {
  GameSchema,
  PaginatedResponseSchema,
  type GamesPaginatedResponse,
} from '@rawg/shared'
import { Router } from 'express'
import type { Router as RouterType } from 'express'
import * as z from 'zod/mini'

import { cache } from '../lib/cache.js'
import { rawgClient } from '../lib/rawg-client.js'
import { stripApiKey } from '../utilities/strip-api-key.js'

const router: RouterType = Router()

router.get('/games', async (req, res) => {
  const cacheKey = req.originalUrl
  const cached = cache.get(cacheKey)
  if (cached) {
    res.json(cached)
    return
  }

  const { data } = await rawgClient.get<GamesPaginatedResponse>('/games', {
    params: req.query,
  })
  const parsed = z.parse(PaginatedResponseSchema(GameSchema), data)

  parsed.next = stripApiKey(parsed.next)
  parsed.previous = stripApiKey(parsed.previous)

  cache.set(cacheKey, parsed)

  res.json(parsed)
})

export { router as gamesRouter }
