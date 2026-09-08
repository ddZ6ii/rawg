import { queryOptions } from '@tanstack/react-query'

import { GameSchema, type Game } from '@/features/games/schemas'
import { createHttpService } from '@/shared/services'

const GAME_KEYS = {
  // Query keys
  all: ['games'] as const,
}

const gameService = createHttpService('/games')

function createGamesQueryOptions<TData = Game[]>(
  select?: (games: Game[]) => TData,
) {
  return queryOptions({
    queryKey: GAME_KEYS.all,
    queryFn: ({ signal }) => gameService.getAll(GameSchema, signal),
    select: (response) => select?.(response.results) ?? response.results,
  })
}

export { createGamesQueryOptions }
