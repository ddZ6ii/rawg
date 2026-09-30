import { describe, expect, it } from 'vitest'

import { GAMES_SEARCH_MAX_LENGTH } from '@rawg/shared'

import { getCharCounter, REMAINING_CHARS_THRESHOLD } from './get-char-counter'

const ofLength = (n: number) => 'a'.repeat(n)

describe('getCharCounter', () => {
  it.each([
    {
      case: 'just below the threshold',
      length: GAMES_SEARCH_MAX_LENGTH - REMAINING_CHARS_THRESHOLD - 1,
      visible: false,
    },
    {
      case: 'at the threshold',
      length: GAMES_SEARCH_MAX_LENGTH - REMAINING_CHARS_THRESHOLD,
      visible: true,
    },
    {
      case: 'at the max length',
      length: GAMES_SEARCH_MAX_LENGTH,
      visible: true,
    },
    {
      case: 'over the max length',
      length: GAMES_SEARCH_MAX_LENGTH + 1,
      visible: false,
    },
  ])('$case ($length chars) → visible: $visible', ({ length, visible }) => {
    expect(getCharCounter(ofLength(length))).toEqual({
      length,
      remaining: GAMES_SEARCH_MAX_LENGTH - length,
      visible,
    })
  })

  it('is hidden with remaining = max for an empty value', () => {
    expect(getCharCounter('')).toEqual({
      length: 0,
      remaining: GAMES_SEARCH_MAX_LENGTH,
      visible: false,
    })
  })

  it('counts the normalized value, not the raw one', () => {
    expect(getCharCounter('   zelda     mario   ')).toEqual({
      length: 'zelda mario'.length,
      remaining: GAMES_SEARCH_MAX_LENGTH - 'zelda mario'.length,
      visible: false,
    })
  })
})
