import { describe, expect, it, vi } from 'vitest'

import {
  GenreSchema,
  InvalidInputError,
  type Genre,
  type PaginatedResponse,
} from '@rawg/shared'

import { createGenresQueryOptions } from './genre.service'

const { getAllMock } = vi.hoisted(() => ({ getAllMock: vi.fn() }))

vi.mock('@/shared/services', () => ({
  createHttpService: () => ({ getAll: getAllMock }),
}))

const genres: Genre[] = [
  { id: 1, name: 'Action', image_background: null },
  { id: 2, name: 'Indie', image_background: null },
]

const paginatedResponse: PaginatedResponse<typeof GenreSchema> = {
  count: genres.length,
  next: null,
  previous: null,
  results: genres,
}

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
