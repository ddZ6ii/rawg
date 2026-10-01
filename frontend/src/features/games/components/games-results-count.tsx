import { useSuspenseQuery } from '@tanstack/react-query'

import type { GamesPaginatedResponse } from '@rawg/shared'

import { createGamesQueryOptions } from '@/features/games/services'
import type { GameQuery } from '@/features/games/types'
import { toGamesParams } from '@/features/games/utilities'
import { formatNumber, Skeleton } from '@/shared'

function selectCount(response: GamesPaginatedResponse) {
  return response.count
}

function GamesResultsCount({ gameQuery }: { gameQuery: GameQuery }) {
  const options = toGamesParams(gameQuery)

  const { data: count } = useSuspenseQuery(
    createGamesQueryOptions({ options, select: selectCount }),
  )

  return (
    <>
      {formatNumber(count)} {count === 1 ? 'result' : 'results'} found
    </>
  )
}

function GamesResultsSkeleton() {
  return <Skeleton className="h-5 w-36" />
}

export { GamesResultsCount, GamesResultsSkeleton }
