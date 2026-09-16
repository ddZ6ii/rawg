import { describe, expect, it } from 'vitest'

import { getCroppedImage } from './get-cropped-image'

describe('getCroppedImage', () => {
  it('inserts crop path with fixed dimensions', () => {
    expect(getCroppedImage('https://media.rawg.io/media/games/foo.jpg')).toBe(
      'https://media.rawg.io/media/crop/600/400/games/foo.jpg',
    )
  })

  it('handles nested game slug paths', () => {
    expect(
      getCroppedImage('https://media.rawg.io/media/screenshots/abc/def123.jpg'),
    ).toBe(
      'https://media.rawg.io/media/crop/600/400/screenshots/abc/def123.jpg',
    )
  })

  it('returns the original url unchanged when it has no media/ segment', () => {
    const url = 'https://example.com/games/foo.jpg'
    expect(getCroppedImage(url)).toBe(url)
  })
})
