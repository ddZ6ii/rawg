import { describe, expect, it, vi } from 'vitest'

import {
  GameSchema,
  InvalidInputError,
  type Game,
  type PaginatedResponse,
} from '@rawg/shared'

import { createGamesQueryOptions } from './game.service'

const { getAllMock } = vi.hoisted(() => ({ getAllMock: vi.fn() }))

vi.mock('@/shared/services', () => ({
  createHttpService: () => ({ getAll: getAllMock }),
}))

const games: Game[] = [
  {
    id: 1,
    name: 'Portal 2',
    background_image: null,
    metacritic: 95,
    parent_platforms: null,
  },
  {
    id: 2,
    name: 'Hades',
    background_image: null,
    metacritic: 93,
    parent_platforms: null,
  },
]

const paginatedResponse: PaginatedResponse<typeof GameSchema> = {
  count: games.length,
  next: null,
  previous: null,
  results: games,
}

describe('createGamesQueryOptions', () => {
  it('builds a queryKey without params when none are provided', () => {
    const options = createGamesQueryOptions()
    expect(options.queryKey).toEqual(['games'])
  })

  it('includes params in the queryKey when provided', () => {
    const options = createGamesQueryOptions({
      options: { genres: '4' },
    })
    expect(options.queryKey).toEqual(['games', { genres: '4' }])
  })

  it('throws InvalidInputError for invalid options', () => {
    expect(() =>
      createGamesQueryOptions({
        options: { genres: 123 as unknown as string },
      }),
    ).toThrow(InvalidInputError)
  })

  it('extracts results via select by default', () => {
    const options = createGamesQueryOptions()
    expect(options.select?.(paginatedResponse)).toEqual(games)
  })

  it('applies a custom select function', () => {
    const options = createGamesQueryOptions({
      select: (result) => result.length,
    })
    expect(options.select?.(paginatedResponse)).toBe(games.length)
  })
})
