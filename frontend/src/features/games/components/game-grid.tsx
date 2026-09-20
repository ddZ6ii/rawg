import { useSuspenseQuery } from '@tanstack/react-query'

import type { GamesParams, Genre, Platform } from '@rawg/shared'

import {
  GameCard,
  GameCardSkeleton,
} from '@/features/games/components/game-card'
import { createGamesQueryOptions } from '@/features/games/services'

function GameGridContainer({ children }: React.PropsWithChildren) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] gap-2 md:gap-4">
      {children}
    </ul>
  )
}

function GameGrid({
  selectedGenreId,
  selectedPlatformId,
}: {
  selectedGenreId: Genre['id'] | undefined
  selectedPlatformId: Platform['id'] | undefined
}) {
  const options: GamesParams = {}

  if (selectedGenreId !== undefined) options.genres = selectedGenreId.toString()
  if (selectedPlatformId !== undefined)
    options.parent_platforms = selectedPlatformId.toString()

  const { data: games } = useSuspenseQuery(createGamesQueryOptions({ options }))

  if (games.length === 0) {
    return (
      <div className="grid h-full place-content-center">
        <p className="text-muted-foreground">No games found.</p>
      </div>
    )
  }

  return (
    <GameGridContainer>
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </GameGridContainer>
  )
}

function GameGridSkeleton({ length = 20 }: { length?: number }) {
  return (
    <GameGridContainer>
      {Array.from({ length }).map((_, index) => (
        <li key={index}>
          <GameCardSkeleton />
        </li>
      ))}
    </GameGridContainer>
  )
}

export { GameGrid, GameGridSkeleton }
