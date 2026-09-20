import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Genre } from '@rawg/shared'

import { GenreItem, GenreItemSkeleton } from './genre-item'

const action: Genre = {
  id: 1,
  name: 'Action',
  image_background: 'https://example.com/action.jpg',
}

const indie: Genre = { id: 2, name: 'Indie', image_background: null }

describe('GenreItem', () => {
  it('renders the genre name and image when image_background is set', () => {
    render(<GenreItem genre={action} isSelected={false} onClick={vi.fn()} />)

    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders a fallback icon when image_background is null', () => {
    render(<GenreItem genre={indie} isSelected={false} onClick={vi.fn()} />)

    expect(screen.getByText('Indie')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('marks itself as selected via the test-id attribute', () => {
    render(<GenreItem genre={action} isSelected={true} onClick={vi.fn()} />)

    expect(screen.getByTestId('genre-item')).toHaveAttribute(
      'data-selected',
      'true',
    )
  })

  it('does not mark itself as selected when not selected', () => {
    render(<GenreItem genre={action} isSelected={false} onClick={vi.fn()} />)

    expect(screen.getByTestId('genre-item')).toHaveAttribute(
      'data-selected',
      'false',
    )
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<GenreItem genre={action} isSelected={false} onClick={onClick} />)

    await user.click(screen.getByTestId('genre-item'))

    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('GenreItemSkeleton', () => {
  it('renders without a genre name', () => {
    render(<GenreItemSkeleton />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
