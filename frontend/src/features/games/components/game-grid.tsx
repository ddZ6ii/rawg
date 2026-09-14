import { useSuspenseQuery } from '@tanstack/react-query'

import { GameCard } from '@/features/games/components/game-card'
import { createGamesQueryOptions } from '@/features/games/services'

export function GameGrid() {
  const { data: games } = useSuspenseQuery(createGamesQueryOptions())

  if (games.length === 0) {
    return (
      <div className="grid h-full place-content-center">
        <p className="text-muted-foreground">No games found.</p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] gap-2 md:gap-4">
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  )
}
