import { queryOptions } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Genre } from '@rawg/shared'

import { createGenresQueryOptions } from '@/features/genres/services'
import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { GenreList, GenreListSkeleton } from './genre-list'

vi.mock('@/features/genres/services', () => ({
  createGenresQueryOptions: vi.fn(),
}))

const action: Genre = { id: 1, name: 'Action', image_background: null }
const indie: Genre = { id: 2, name: 'Indie', image_background: null }

function mockGenres(genres: Genre[]) {
  vi.mocked(createGenresQueryOptions).mockReturnValue(
    queryOptions({
      queryKey: ['genres', 'test'],
      queryFn: () => Promise.resolve(genres),
    }) as unknown as ReturnType<typeof createGenresQueryOptions>,
  )
}

function renderGenreList(selectedGenre: Genre | null = null) {
  const onSelectGenre = vi.fn()
  const view = render(
    <GenreList selectedGenre={selectedGenre} onSelectGenre={onSelectGenre} />,
    { wrapper: RenderWithProvider },
  )
  return { ...view, onSelectGenre }
}

describe('GenreList', () => {
  it('renders a list item for each genre', async () => {
    mockGenres([action, indie])
    renderGenreList()

    expect(await screen.findByText('Action')).toBeInTheDocument()
    expect(await screen.findByText('Indie')).toBeInTheDocument()
    expect(screen.getAllByTestId('genre-item')).toHaveLength(2)
  })

  it('shows "No genres found." when there are none', async () => {
    mockGenres([])
    renderGenreList()

    expect(await screen.findByText('No genres found.')).toBeInTheDocument()
  })

  it('marks the selected genre', async () => {
    mockGenres([action, indie])
    renderGenreList(indie)

    const items = await screen.findAllByTestId('genre-item')
    expect(
      screen.getByText('Indie').closest('[data-testid="genre-item"]'),
    ).toHaveAttribute('data-selected', 'true')
    expect(items).toHaveLength(2)
  })

  it('calls onSelectGenre with the clicked genre', async () => {
    mockGenres([action, indie])
    const user = userEvent.setup()
    const { onSelectGenre } = renderGenreList()

    await user.click(await screen.findByText('Indie'))

    expect(onSelectGenre).toHaveBeenCalledWith(indie)
  })
})

describe('GenreListSkeleton', () => {
  it('renders the default number of skeleton items', () => {
    render(<GenreListSkeleton />)

    expect(document.querySelectorAll('li')).toHaveLength(19)
  })

  it('renders a custom number of skeleton items', () => {
    render(<GenreListSkeleton length={3} />)

    expect(document.querySelectorAll('li')).toHaveLength(3)
  })
})
