import { describe, expect, it, vi } from 'vitest'

import { InvalidInputError } from '@rawg/shared'

import { createGenre, toPaginatedResponse } from '@/tests/utilities'

import { createGenresQueryOptions } from './genre.service'

const { getAllMock } = vi.hoisted(() => ({ getAllMock: vi.fn() }))

vi.mock('@/shared/services', () => ({
  createHttpService: () => ({ getAll: getAllMock }),
}))

const genres = [
  createGenre({ id: 1, name: 'Action' }),
  createGenre({ id: 2, name: 'Indie' }),
]

const paginatedResponse = toPaginatedResponse(genres)

describe('createGenresQueryOptions', () => {
  it('builds a queryKey without params when none are provided', () => {
    const options = createGenresQueryOptions()
    expect(options.queryKey).toEqual(['genres'])
  })

  it('includes params in the queryKey when provided', () => {
    const options = createGenresQueryOptions({
      options: { ordering: 'name' },
    })
    expect(options.queryKey).toEqual(['genres', { ordering: 'name' }])
  })

  it('throws InvalidInputError for invalid options', () => {
    expect(() =>
      createGenresQueryOptions({
        options: { ordering: 123 as unknown as string },
      }),
    ).toThrow(InvalidInputError)
  })

  it('extracts results via select by default', () => {
    const options = createGenresQueryOptions()
    expect(options.select?.(paginatedResponse)).toEqual(genres)
  })

  it('applies a custom select function', () => {
    const options = createGenresQueryOptions({
      select: (result) => result.length,
    })
    expect(options.select?.(paginatedResponse)).toBe(genres.length)
  })
})
