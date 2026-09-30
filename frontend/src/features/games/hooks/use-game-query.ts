import { useCallback, useDeferredValue, useState } from 'react'

import type { GamesSortOrders, Genre, Platform } from '@rawg/shared'

import type { GameQuery } from '@/features/games/types'

const EMPTY_GAME_QUERY: GameQuery = {
  genre: null,
  platform: null,
  search: null,
  ordering: null,
}

/**
 * Owns the games filter state (genre, platform, search, ordering).
 *
 * @returns
 * - `gameQuery`: the latest query, for controls that must reflect input
 *   immediately.
 * - `deferredGameQuery`: lags behind `gameQuery` while the matching data
 *   loads, for the grid and title so they keep showing previous results.
 * - `isPending`: `true` while `deferredGameQuery` hasn't caught up.
 * - Stable setters for each filter. Selecting the current genre again clears
 *   it.
 */
export function useGameQuery() {
  const [gameQuery, setGameQuery] = useState<GameQuery>(EMPTY_GAME_QUERY)
  const deferredGameQuery = useDeferredValue(gameQuery)

  const selectGenre = useCallback((genre: Genre) => {
    setGameQuery((prev) => ({
      ...prev,
      genre: genre.id === prev.genre?.id ? null : genre,
    }))
  }, [])

  const selectPlatform = useCallback((platform: Platform | null) => {
    setGameQuery((prev) => ({ ...prev, platform }))
  }, [])

  const selectSortOrder = useCallback((ordering: GamesSortOrders | null) => {
    setGameQuery((prev) => ({ ...prev, ordering }))
  }, [])

  const setSearch = useCallback((search: string | null) => {
    setGameQuery((prev) => ({ ...prev, search }))
  }, [])

  return {
    gameQuery,
    deferredGameQuery,
    isPending: gameQuery !== deferredGameQuery,
    selectGenre,
    selectPlatform,
    selectSortOrder,
    setSearch,
  }
}
