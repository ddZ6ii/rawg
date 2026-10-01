import { queryOptions } from '@tanstack/react-query'

import {
  GameSchema,
  GamesParamsSchema,
  InvalidInputError,
  type GamesPaginatedResponse,
  type GamesParams,
} from '@rawg/shared'

import { createHttpService } from '@/shared'

const GAME_KEYS = {
  // Query keys
  all: ['games'] as const,
}

const gameService = createHttpService('/games')

/**
 * Unlike other services, `select` receives the full paginated response (not
 * just `results`) so consumers can read `count`. Components sharing the same
 * `options` share one cached request, each selecting its own slice.
 */
function createGamesQueryOptions<TData = GamesPaginatedResponse>({
  options = {},
  select,
}: {
  options?: GamesParams
  select?: (response: GamesPaginatedResponse) => TData
} = {}) {
  const parsedOptions = GamesParamsSchema.safeParse(options)
  if (!parsedOptions.success) {
    throw new InvalidInputError(
      parsedOptions.error,
      'Invalid query options passed to createGamesQueryOptions',
    )
  }

  const params = parsedOptions.data

  return queryOptions({
    queryKey:
      Object.keys(params).length > 0
        ? [...GAME_KEYS.all, params]
        : GAME_KEYS.all,
    queryFn: ({ signal }) => gameService.getAll(GameSchema, signal, params),
    select: (response) => (select ? select(response) : response) as TData,
  })
}

export { createGamesQueryOptions }
