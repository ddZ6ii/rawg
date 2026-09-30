import { queryOptions } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Game, Genre, Platform } from '@rawg/shared'

import { createGamesQueryOptions } from '@/features/games/services'
import type { GameQuery } from '@/features/games/types'
import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { GameGrid, GameGridSkeleton } from './game-grid'

vi.mock('@/features/games/services', () => ({
  createGamesQueryOptions: vi.fn(),
}))

const action: Genre = { id: 1, name: 'Action', image_background: null }
const pc: Platform = { id: 1, name: 'PC', slug: 'pc' }

const portal2: Game = {
  id: 1,
  name: 'Portal 2',
  background_image: null,
  metacritic: 95,
  parent_platforms: null,
}

function mockGames(games: Game[]) {
  vi.mocked(createGamesQueryOptions).mockReturnValue(
    queryOptions({
      queryKey: ['games', 'test'],
      queryFn: () => Promise.resolve(games),
    }) as unknown as ReturnType<typeof createGamesQueryOptions>,
  )
}

function renderGameGrid(gameQuery: GameQuery) {
  return render(<GameGrid gameQuery={gameQuery} />, {
    wrapper: RenderWithProvider,
  })
}

const emptyQuery: GameQuery = {
  genre: null,
  platform: null,
  search: null,
  ordering: null,
}

describe('GameGrid', () => {
  it('renders a card for each game', async () => {
    mockGames([portal2])
    renderGameGrid(emptyQuery)

    expect(await screen.findByText('Portal 2')).toBeInTheDocument()
  })

  it('shows "No games found." when there are none', async () => {
    mockGames([])
    renderGameGrid(emptyQuery)

    expect(await screen.findByText('No games found.')).toBeInTheDocument()
  })

  it('omits all filters when none is selected', async () => {
    mockGames([portal2])
    renderGameGrid(emptyQuery)

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith({ options: {} })
  })

  it('passes genres when a genre is selected', async () => {
    mockGames([portal2])
    renderGameGrid({ ...emptyQuery, genre: action })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith({
      options: { genres: '1' },
    })
  })

  it('passes parent_platforms when a platform is selected', async () => {
    mockGames([portal2])
    renderGameGrid({ ...emptyQuery, platform: pc })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith({
      options: { parent_platforms: '1' },
    })
  })

  it('passes ordering when a sort order is selected', async () => {
    mockGames([portal2])
    renderGameGrid({ ...emptyQuery, ordering: '-released' })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith({
      options: { ordering: '-released' },
    })
  })

  it('passes search when a search term is set', async () => {
    mockGames([portal2])
    renderGameGrid({ ...emptyQuery, search: 'portal' })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith({
      options: { search: 'portal' },
    })
  })

  it('passes all filters when all are selected', async () => {
    mockGames([portal2])
    renderGameGrid({
      genre: action,
      platform: pc,
      search: 'portal',
      ordering: 'name',
    })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith({
      options: {
        genres: '1',
        parent_platforms: '1',
        search: 'portal',
        ordering: 'name',
      },
    })
  })
})

describe('GameGridSkeleton', () => {
  it('renders the default number of skeleton items', () => {
    render(<GameGridSkeleton />)

    expect(document.querySelectorAll('li')).toHaveLength(20)
  })

  it('renders a custom number of skeleton items', () => {
    render(<GameGridSkeleton length={5} />)

    expect(document.querySelectorAll('li')).toHaveLength(5)
  })
})
