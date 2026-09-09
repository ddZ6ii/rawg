import { describe, expect, it } from 'vitest'

import { stripApiKey } from './strip-api-key.js'

describe('stripApiKey', () => {
  it('returns null when given null', () => {
    expect(stripApiKey(null)).toBeNull()
  })

  it('removes the key query param', () => {
    const url = 'https://api.rawg.io/api/games?key=secret123&page=2'
    expect(stripApiKey(url)).toBe('https://api.rawg.io/api/games?page=2')
  })

  it('preserves other query params', () => {
    const url =
      'https://api.rawg.io/api/games?key=secret123&page=2&page_size=20'
    expect(stripApiKey(url)).toBe(
      'https://api.rawg.io/api/games?page=2&page_size=20',
    )
  })

  it('leaves a URL without a key param unchanged', () => {
    const url = 'https://api.rawg.io/api/games?page=2'
    expect(stripApiKey(url)).toBe(url)
  })
})
