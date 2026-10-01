import { describe, expect, it } from 'vitest'

import { createGenre } from '@/tests/utilities'

import { getPageTitle } from './get-page-title'

const genre = createGenre({ id: 1, name: 'action' })

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

  it('appends the search term when only search is set', () => {
    expect(getPageTitle(undefined, undefined, 'zelda')).toBe(
      'All Games matching "zelda"',
    )
  })

  it('appends the search term to genre and platform', () => {
    expect(getPageTitle(genre.name, 'PC', 'zelda')).toBe(
      'Action for PC matching "zelda"',
    )
  })
})
