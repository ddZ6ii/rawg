import { queryOptions } from '@tanstack/react-query'

import {
  GameSchema,
  GamesParamsSchema,
  InvalidInputError,
  type Game,
  type GamesParams,
} from '@rawg/shared'

import { createHttpService } from '@/shared/services'

const GAME_KEYS = {
  // Query keys
  all: ['games'] as const,
}

const gameService = createHttpService('/games')

function createGamesQueryOptions<TData = Game[]>({
  options = {},
  select,
}: {
  options?: GamesParams
  select?: (games: Game[]) => TData
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
    select: (response) =>
      (select ? select(response.results) : response.results) as TData,
  })
}

export { createGamesQueryOptions }
