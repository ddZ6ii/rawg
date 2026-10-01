import { queryOptions } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { useDeferredValue } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { GamesPaginatedResponse, GamesParams } from '@rawg/shared'

import { EMPTY_GAME_QUERY } from '@/features/games/hooks'
import { createGamesQueryOptions } from '@/features/games/services'
import type { GameQuery } from '@/features/games/types'
import { SuspenseQueryBoundary } from '@/shared'
import { RenderWithProvider, toPaginatedResponse } from '@/tests/utilities'

import { GamesResultsCount, GamesResultsSkeleton } from './games-results-count'

vi.mock('@/features/games/services', () => ({
  createGamesQueryOptions: vi.fn(),
}))

/** Mocks the query options, resolving each query with `queryFn(options)`. */
function mockQuery(
  queryFn: (options?: GamesParams) => Promise<GamesPaginatedResponse>,
) {
  vi.mocked(createGamesQueryOptions).mockImplementation(
    ({ options, select } = {}) =>
      queryOptions({
        queryKey: ['games', options],
        queryFn: () => queryFn(options),
        select,
      }) as unknown as ReturnType<typeof createGamesQueryOptions>,
  )
}

function mockCount(count: number) {
  mockQuery(() => Promise.resolve(toPaginatedResponse([], count)))
}

function renderGamesResultsCount(gameQuery: GameQuery = EMPTY_GAME_QUERY) {
  return render(<GamesResultsCount gameQuery={gameQuery} />, {
    wrapper: RenderWithProvider,
  })
}

/** Mirrors app.tsx: deferred query inside a boundary that renders nothing on error. */
function DeferredCount({ gameQuery }: { gameQuery: GameQuery }) {
  const deferredGameQuery = useDeferredValue(gameQuery)

  return (
    <SuspenseQueryBoundary
      fallback={() => null}
      loadingFallback={<GamesResultsSkeleton />}
    >
      <GamesResultsCount gameQuery={deferredGameQuery} />
    </SuspenseQueryBoundary>
  )
}

describe('GamesResultsCount', () => {
  it('uses the singular for a single result', async () => {
    mockCount(1)
    renderGamesResultsCount()

    expect(await screen.findByText('1 result found')).toBeInTheDocument()
  })

  it('uses the plural with a formatted count', async () => {
    mockCount(1234)
    renderGamesResultsCount()

    expect(
      await screen.findByText(`${(1234).toLocaleString()} results found`),
    ).toBeInTheDocument()
  })

  it('uses the plural for zero results', async () => {
    mockCount(0)
    renderGamesResultsCount()

    expect(await screen.findByText('0 results found')).toBeInTheDocument()
  })

  it('passes the query filters as options', async () => {
    mockCount(1)
    renderGamesResultsCount({ ...EMPTY_GAME_QUERY, search: 'portal' })

    await screen.findByText('1 result found')
    expect(createGamesQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ options: { search: 'portal' } }),
    )
  })

  it('renders nothing when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(vi.fn())
    mockQuery(() => Promise.reject(new Error('boom')))

    const { container } = render(
      <DeferredCount gameQuery={EMPTY_GAME_QUERY} />,
      {
        wrapper: RenderWithProvider,
      },
    )

    await vi.waitFor(() => {
      expect(
        container.querySelector('[data-slot="skeleton"]'),
      ).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('keeps the previous count while the next query loads', async () => {
    let resolveNext: (response: GamesPaginatedResponse) => void = vi.fn()
    mockQuery((options) =>
      options?.search === 'portal'
        ? new Promise((resolve) => (resolveNext = resolve))
        : Promise.resolve(toPaginatedResponse([], 1)),
    )

    const { container, rerender } = render(
      <DeferredCount gameQuery={EMPTY_GAME_QUERY} />,
      { wrapper: RenderWithProvider },
    )
    await screen.findByText('1 result found')

    rerender(
      <DeferredCount gameQuery={{ ...EMPTY_GAME_QUERY, search: 'portal' }} />,
    )

    expect(screen.getByText('1 result found')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument()

    // act() flushes the resumed (previously suspended) render
    await act(async () => {
      resolveNext(toPaginatedResponse([], 2))
      await Promise.resolve()
    })

    expect(await screen.findByText('2 results found')).toBeInTheDocument()
  })
})

describe('GamesResultsSkeleton', () => {
  it('renders a skeleton placeholder', () => {
    const { container } = render(<GamesResultsSkeleton />)

    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
  })
})
