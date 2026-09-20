import { describe, expect, it } from 'vitest'

import type { Genre } from '@rawg/shared'

import { getPageTitle } from './get-page-title'

const genre: Genre = { id: 1, name: 'action', image_background: null }

describe('getPageTitle', () => {
  it('returns default title when nothing is selected', () => {
    expect(getPageTitle(undefined, undefined)).toBe('All Games')
  })

  it('returns capitalized genre name when only genre is selected', () => {
    expect(getPageTitle(genre.name, undefined)).toBe('Action')
  })

  it('returns platform-only title when only platform is selected', () => {
    expect(getPageTitle(undefined, 'PC')).toBe('All Games for PC')
  })

  it('combines genre and platform when both are selected', () => {
    expect(getPageTitle(genre.name, 'PC')).toBe('Action for PC')
  })
})
