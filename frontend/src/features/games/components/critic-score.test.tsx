import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CriticScore } from './critic-score'

describe('CriticScore', () => {
  it('renders nothing when score is null', () => {
    const { container } = render(<CriticScore score={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('uses the success variant for scores >= 75', () => {
    render(<CriticScore score={75} />)

    expect(screen.getByTestId('critic-score')).toHaveAttribute(
      'data-variant',
      'success',
    )
  })

  it('uses the warning variant for scores between 60 and 74', () => {
    render(<CriticScore score={60} />)

    expect(screen.getByTestId('critic-score')).toHaveAttribute(
      'data-variant',
      'warning',
    )
  })

  it('uses the destructive variant for scores below 60', () => {
    render(<CriticScore score={59} />)

    expect(screen.getByTestId('critic-score')).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })

  it('renders the score value', () => {
    render(<CriticScore score={82} />)

    expect(screen.getByTestId('critic-score')).toHaveTextContent('82')
  })
})
