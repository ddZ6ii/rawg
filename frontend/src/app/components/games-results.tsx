import { type GameQuery, GameGrid, GameGridSkeleton } from '@/features/games'
import { cn, SuspenseQueryBoundary, WidgetErrorFallback } from '@/shared'

export function GamesResults({
  gameQuery,
  isPending,
}: {
  /** The deferred query, so previous results stay visible while loading */
  gameQuery: GameQuery
  isPending: boolean
}) {
  return (
    <div
      aria-busy={isPending}
      className={cn(
        'flex-1 transition-opacity',
        isPending && 'opacity-60 delay-150',
      )}
    >
      <SuspenseQueryBoundary
        fallback={(props) => (
          <WidgetErrorFallback
            message="Couldn't load games."
            className="h-full place-content-start"
            {...props}
          />
        )}
        loadingFallback={<GameGridSkeleton />}
        // Changing a filter after an error retries without a manual "retry"
        resetKeys={[gameQuery]}
      >
        <GameGrid gameQuery={gameQuery} />
      </SuspenseQueryBoundary>
    </div>
  )
}
