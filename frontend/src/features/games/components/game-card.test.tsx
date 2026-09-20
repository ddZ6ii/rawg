import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Game } from '@rawg/shared'

import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { GameCard, GameCardSkeleton } from './game-card'

const pc = { id: 1, name: 'PC', slug: 'pc' }

const portal2: Game = {
  id: 1,
  name: 'Portal 2',
  background_image: 'https://example.com/portal2.jpg',
  metacritic: 95,
  parent_platforms: [{ platform: pc }],
}

const noThumbnail: Game = {
  id: 2,
  name: 'Unknown Game',
  background_image: null,
  metacritic: null,
  parent_platforms: null,
}

function renderGameCard(game: Game) {
  return render(<GameCard game={game} />, { wrapper: RenderWithProvider })
}

describe('GameCard', () => {
  it('renders the name and image when background_image is set', () => {
    renderGameCard(portal2)

    expect(screen.getByText('Portal 2')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Portal 2' })).toBeInTheDocument()
  })

  it('renders a fallback when background_image is null', () => {
    renderGameCard(noThumbnail)

    expect(screen.getByText('No thumbnail available')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a platform icon per parent platform', () => {
    renderGameCard(portal2)

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('renders no platform icons when parent_platforms is null', () => {
    renderGameCard(noThumbnail)

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('renders the critic score when metacritic is set', () => {
    renderGameCard(portal2)

    expect(screen.getByTestId('critic-score')).toHaveTextContent('95')
  })

  it('renders no critic score when metacritic is null', () => {
    renderGameCard(noThumbnail)

    expect(screen.queryByTestId('critic-score')).not.toBeInTheDocument()
  })
})

describe('GameCardSkeleton', () => {
  it('renders without a game name', () => {
    render(<GameCardSkeleton />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
