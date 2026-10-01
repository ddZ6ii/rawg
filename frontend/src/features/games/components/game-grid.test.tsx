import { queryOptions } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Game, GamesPaginatedResponse } from '@rawg/shared'

import { EMPTY_GAME_QUERY } from '@/features/games/hooks'
import { createGamesQueryOptions } from '@/features/games/services'
import type { GameQuery } from '@/features/games/types'
import {
  createGame,
  createGenre,
  createPlatform,
  RenderWithProvider,
  toPaginatedResponse,
} from '@/tests/utilities'

import { GameGrid, GameGridSkeleton } from './game-grid'

vi.mock('@/features/games/services', () => ({
  createGamesQueryOptions: vi.fn(),
}))

const action = createGenre({ id: 1, name: 'Action' })
const pc = createPlatform({ id: 1, name: 'PC', slug: 'pc' })
const portal2 = createGame({ name: 'Portal 2' })

function mockGames(games: Game[]) {
  vi.mocked(createGamesQueryOptions).mockImplementation(
    ({ select } = {}) =>
      queryOptions({
        queryKey: ['games', 'test'],
        queryFn: (): Promise<GamesPaginatedResponse> =>
          Promise.resolve(toPaginatedResponse(games)),
        select,
      }) as unknown as ReturnType<typeof createGamesQueryOptions>,
  )
}

function renderGameGrid(gameQuery: GameQuery) {
  return render(<GameGrid gameQuery={gameQuery} />, {
    wrapper: RenderWithProvider,
  })
}

describe('GameGrid', () => {
  it('renders a card for each game', async () => {
    mockGames([portal2])
    renderGameGrid(EMPTY_GAME_QUERY)

    expect(await screen.findByText('Portal 2')).toBeInTheDocument()
  })

  it('shows "No games found." when there are none', async () => {
    mockGames([])
    renderGameGrid(EMPTY_GAME_QUERY)

    expect(await screen.findByText('No games found.')).toBeInTheDocument()
  })

  it('omits all filters when none is selected', async () => {
    mockGames([portal2])
    renderGameGrid(EMPTY_GAME_QUERY)

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ options: {} }),
    )
  })

  it('passes genres when a genre is selected', async () => {
    mockGames([portal2])
    renderGameGrid({ ...EMPTY_GAME_QUERY, genre: action })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { genres: '1' },
      }),
    )
  })

  it('passes parent_platforms when a platform is selected', async () => {
    mockGames([portal2])
    renderGameGrid({ ...EMPTY_GAME_QUERY, platform: pc })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { parent_platforms: '1' },
      }),
    )
  })

  it('passes ordering when a sort order is selected', async () => {
    mockGames([portal2])
    renderGameGrid({ ...EMPTY_GAME_QUERY, ordering: '-released' })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { ordering: '-released' },
      }),
    )
  })

  it('passes search when a search term is set', async () => {
    mockGames([portal2])
    renderGameGrid({ ...EMPTY_GAME_QUERY, search: 'portal' })

    await screen.findByText('Portal 2')
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { search: 'portal' },
      }),
    )
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
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          genres: '1',
          parent_platforms: '1',
          search: 'portal',
          ordering: 'name',
        },
      }),
    )
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
