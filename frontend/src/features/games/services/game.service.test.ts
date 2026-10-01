import { describe, expect, it, vi } from 'vitest'

import { InvalidInputError } from '@rawg/shared'

import { createGame, toPaginatedResponse } from '@/tests/utilities'

import { createGamesQueryOptions } from './game.service'

const { getAllMock } = vi.hoisted(() => ({ getAllMock: vi.fn() }))

vi.mock('@/shared/services', () => ({
  createHttpService: () => ({ getAll: getAllMock }),
}))

const games = [
  createGame({ id: 1, name: 'Portal 2' }),
  createGame({ id: 2, name: 'Hades' }),
]

const paginatedResponse = toPaginatedResponse(games)

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

  it('returns the full response by default', () => {
    const options = createGamesQueryOptions()
    expect(options.select?.(paginatedResponse)).toEqual(paginatedResponse)
  })

  it('applies a custom select function', () => {
    const options = createGamesQueryOptions({
      select: (response) => response.results.length,
    })
    expect(options.select?.(paginatedResponse)).toBe(games.length)
  })
})
