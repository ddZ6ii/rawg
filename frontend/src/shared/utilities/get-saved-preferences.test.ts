import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSavedPreferences } from './get-saved-preferences'

describe('getSavedPreferences', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns null when key is not set', () => {
    expect(getSavedPreferences('missing-key')).toBeNull()
  })

  it('returns the stored theme when valid', () => {
    localStorage.setItem('prefs', JSON.stringify({ theme: 'dark' }))
    expect(getSavedPreferences('prefs')).toEqual({ theme: 'dark' })
  })

  it('returns no theme when missing from stored object', () => {
    localStorage.setItem('prefs', JSON.stringify({}))
    expect(getSavedPreferences('prefs')).toEqual({})
  })

  it('returns null when stored theme is invalid', () => {
    localStorage.setItem('prefs', JSON.stringify({ theme: 'neon' }))
    expect(getSavedPreferences('prefs')).toBeNull()
  })

  it('returns null when stored value is malformed JSON', () => {
    localStorage.setItem('prefs', 'not-json')
    expect(getSavedPreferences('prefs')).toBeNull()
  })

  it('returns null when stored value is valid JSON but not an object', () => {
    localStorage.setItem('prefs', JSON.stringify('dark'))
    expect(getSavedPreferences('prefs')).toBeNull()
  })

  it('returns null when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('access denied')
    })

    expect(getSavedPreferences('prefs')).toBeNull()
  })
})
