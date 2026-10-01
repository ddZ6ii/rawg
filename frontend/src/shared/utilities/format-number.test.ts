import { describe, expect, it } from 'vitest'

import { formatNumber } from './format-number'

// Output depends on the system locale, so compare against the runtime's own
// default formatting instead of hard-coding separators.
describe('formatNumber', () => {
  it('formats with the system locale', () => {
    expect(formatNumber(1234567)).toBe((1234567).toLocaleString())
  })

  it('applies custom options', () => {
    expect(formatNumber(0.5, { style: 'percent' })).toBe(
      (0.5).toLocaleString(undefined, { style: 'percent' }),
    )
  })
})
