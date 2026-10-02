import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GameRating } from './game-rating'

describe('GameRating', () => {
  it.each([null, undefined, 0])(
    'renders nothing when rating is %s',
    (rating) => {
      const { container } = render(<GameRating rating={rating} />)

      expect(container).toBeEmptyDOMElement()
    },
  )

  it.each([2, 6])('renders nothing for unknown rating %i', (rating) => {
    const { container } = render(<GameRating rating={rating} />)

    expect(container).toBeEmptyDOMElement()
  })

  it.each([
    [1, 'Skip'],
    [3, 'Meh'],
    [4, 'Recommended'],
    [5, 'Exceptional'],
  ])('renders the label for rating %i', (rating, text) => {
    render(<GameRating rating={rating} />)

    expect(screen.getByText(text)).toBeInTheDocument()
  })
})
