import { describe, expect, it } from 'vitest'

import type { Genre, Platform } from '@rawg/shared'

import type { GameQuery } from '@/features/games/types'
import { toGamesParams } from './to-games-params'

const genre: Genre = { id: 4, name: 'Action', image_background: null }
const platform: Platform = { id: 1, name: 'PC', slug: 'pc' }

const emptyQuery: GameQuery = { genre: null, platform: null, ordering: null }

describe('toGamesParams', () => {
  it('returns an empty object when no filters are set', () => {
    expect(toGamesParams(emptyQuery)).toEqual({})
  })

  it('maps genre to genres', () => {
    expect(toGamesParams({ ...emptyQuery, genre })).toEqual({ genres: '4' })
  })

  it('maps platform to parent_platforms', () => {
    expect(toGamesParams({ ...emptyQuery, platform })).toEqual({
      parent_platforms: '1',
    })
  })

  it('maps ordering as-is', () => {
    expect(toGamesParams({ ...emptyQuery, ordering: '-released' })).toEqual({
      ordering: '-released',
    })
  })

  it('combines all filters when present', () => {
    expect(toGamesParams({ genre, platform, ordering: 'name' })).toEqual({
      genres: '4',
      parent_platforms: '1',
      ordering: 'name',
    })
  })
})
