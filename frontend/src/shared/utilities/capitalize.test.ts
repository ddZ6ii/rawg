import { describe, expect, it } from 'vitest'

import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('capitalizes single word', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('capitalizes each word in a multi-word string', () => {
    expect(capitalize('hello world')).toBe('Hello World')
  })

  it('leaves already-capitalized string unchanged', () => {
    expect(capitalize('Hello World')).toBe('Hello World')
  })

  it('handles all-uppercase input', () => {
    expect(capitalize('HELLO WORLD')).toBe('HELLO WORLD')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('handles multiple spaces between words', () => {
    expect(capitalize('hello  world')).toBe('Hello  World')
  })
})
