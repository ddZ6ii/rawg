import { useSuspenseQuery } from '@tanstack/react-query'

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
    <ul className="list-inside space-y-1">
      {games.map((game) => (
        <li key={game.id}>{game.name}</li>
      ))}
    </ul>
  )
}
