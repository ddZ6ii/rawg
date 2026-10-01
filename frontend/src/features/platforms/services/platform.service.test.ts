import { describe, expect, it, vi } from 'vitest'

import { InvalidInputError } from '@rawg/shared'

import { createPlatform, toPaginatedResponse } from '@/tests/utilities'

import { createPlatformsQueryOptions } from './platform.service'

const { getAllMock } = vi.hoisted(() => ({ getAllMock: vi.fn() }))

vi.mock('@/shared/services', () => ({
  createHttpService: () => ({ getAll: getAllMock }),
}))

const platforms = [
  createPlatform({ id: 1, name: 'PC', slug: 'pc' }),
  createPlatform({ id: 2, name: 'PlayStation', slug: 'playstation' }),
]

const paginatedResponse = toPaginatedResponse(platforms)

describe('createPlatformsQueryOptions', () => {
  it('builds a queryKey without params when none are provided', () => {
    const options = createPlatformsQueryOptions()
    expect(options.queryKey).toEqual(['platforms'])
  })

  it('includes params in the queryKey when provided', () => {
    const options = createPlatformsQueryOptions({
      options: { ordering: 'name' },
    })
    expect(options.queryKey).toEqual(['platforms', { ordering: 'name' }])
  })

  it('throws InvalidInputError for invalid options', () => {
    expect(() =>
      createPlatformsQueryOptions({
        options: { ordering: 123 as unknown as string },
      }),
    ).toThrow(InvalidInputError)
  })

  it('extracts results via select by default', () => {
    const options = createPlatformsQueryOptions()
    expect(options.select?.(paginatedResponse)).toEqual(platforms)
  })

  it('applies a custom select function', () => {
    const options = createPlatformsQueryOptions({
      select: (result) => result.length,
    })
    expect(options.select?.(paginatedResponse)).toBe(platforms.length)
  })
})
