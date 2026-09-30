import { describe, expect, it } from 'vitest'

import { normalizeSearch } from './normalize-search'

describe('normalizeSearch', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeSearch('  zelda  ')).toBe('zelda')
  })

  it('collapses inner whitespace runs into a single space', () => {
    expect(normalizeSearch('zelda   breath  of the\twild')).toBe(
      'zelda breath of the wild',
    )
  })

  it('treats tabs and newlines as whitespace', () => {
    expect(normalizeSearch('\tzelda\n\nmario\r\n')).toBe('zelda mario')
  })

  it('returns an empty string for empty or whitespace-only input', () => {
    expect(normalizeSearch('')).toBe('')
    expect(normalizeSearch(' \t\n ')).toBe('')
  })

  it('leaves an already normalized term unchanged', () => {
    expect(normalizeSearch('zelda mario')).toBe('zelda mario')
  })
})
