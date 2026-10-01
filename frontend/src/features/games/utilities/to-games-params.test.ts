import { describe, expect, it } from 'vitest'

import { EMPTY_GAME_QUERY } from '@/features/games/hooks'
import { createGenre, createPlatform } from '@/tests/utilities'

import { toGamesParams } from './to-games-params'

const genre = createGenre({ id: 4, name: 'Action' })
const platform = createPlatform({ id: 1, name: 'PC', slug: 'pc' })

describe('toGamesParams', () => {
  it('returns an empty object when no filters are set', () => {
    expect(toGamesParams(EMPTY_GAME_QUERY)).toEqual({})
  })

  it('maps genre to genres', () => {
    expect(toGamesParams({ ...EMPTY_GAME_QUERY, genre })).toEqual({
      genres: '4',
    })
  })

  it('maps platform to parent_platforms', () => {
    expect(toGamesParams({ ...EMPTY_GAME_QUERY, platform })).toEqual({
      parent_platforms: '1',
    })
  })

  it('maps ordering as-is', () => {
    expect(
      toGamesParams({ ...EMPTY_GAME_QUERY, ordering: '-released' }),
    ).toEqual({
      ordering: '-released',
    })
  })

  it('maps search as-is', () => {
    expect(toGamesParams({ ...EMPTY_GAME_QUERY, search: 'zelda' })).toEqual({
      search: 'zelda',
    })
  })

  it('combines all filters when present', () => {
    expect(
      toGamesParams({ genre, platform, search: 'zelda', ordering: 'name' }),
    ).toEqual({
      genres: '4',
      parent_platforms: '1',
      search: 'zelda',
      ordering: 'name',
    })
  })
})
