import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Game } from '@rawg/shared'

import {
  createGame,
  createPlatform,
  RenderWithProvider,
} from '@/tests/utilities'

import { GameCard, GameCardSkeleton } from './game-card'

const noThumbnail = createGame({ id: 2, name: 'Unknown Game' })
const pc = createPlatform({ id: 1, name: 'PC', slug: 'pc' })
const portal2 = createGame({
  name: 'Portal 2',
  background_image: 'https://example.com/portal2.jpg',
  metacritic: 95,
  parent_platforms: [{ platform: pc }],
})

function renderGameCard(game: Game) {
  return render(<GameCard game={game} />, { wrapper: RenderWithProvider })
}

describe('GameCard', () => {
  it('renders the name and image when background_image is set', () => {
    renderGameCard(portal2)

    expect(screen.getByText('Portal 2')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Portal 2' })).toBeInTheDocument()
  })

  it('renders a fallback image when background_image is null', () => {
    renderGameCard(noThumbnail)

    expect(
      screen.getByRole('img', {
        name: `No thumbnail available for ${noThumbnail.name}`,
      }),
    ).toBeInTheDocument()
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
