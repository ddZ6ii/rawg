import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EMPTY_GAME_QUERY } from '@/features/games/hooks'
import { apiClient } from '@/shared/services/api-client.service'
import {
  createGame,
  RenderWithProvider,
  toPaginatedResponse,
} from '@/tests/utilities'

import { GameGrid } from './game-grid'
import { GamesResultsCount } from './games-results-count'

// No service mock: exercises the real query options (key + select) so both
// components must share a single request through the query cache.

const response = toPaginatedResponse([createGame({ name: 'Portal 2' })], 1234)

describe('GamesResultsCount + GameGrid', () => {
  it('share a single request and render the same response', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: response })

    render(
      <>
        <GamesResultsCount gameQuery={EMPTY_GAME_QUERY} />
        <GameGrid gameQuery={EMPTY_GAME_QUERY} />
      </>,
      { wrapper: RenderWithProvider },
    )

    expect(
      await screen.findByText(`${(1234).toLocaleString()} results found`),
    ).toBeInTheDocument()
    expect(screen.getByText('Portal 2')).toBeInTheDocument()
    expect(get).toHaveBeenCalledOnce()
  })
})
