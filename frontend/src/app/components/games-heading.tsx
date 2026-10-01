import {
  type GameQuery,
  GamesResultsCount,
  GamesResultsSkeleton,
} from '@/features/games'
import { getPageTitle, SuspenseQueryBoundary, TruncatedTooltip } from '@/shared'

const renderNothing = () => null

export function GamesHeading({
  gameQuery,
}: {
  /** The deferred query, so the title matches the results on screen */
  gameQuery: GameQuery
}) {
  const title = getPageTitle(
    gameQuery.genre?.name,
    gameQuery.platform?.name,
    gameQuery.search,
  )

  return (
    <div className="flex flex-wrap items-end justify-between gap-1">
      <TruncatedTooltip tooltip={title}>
        <h1 className="min-w-0 truncate text-xl font-semibold lg:text-2xl">
          {title}
        </h1>
      </TruncatedTooltip>

      {/* Live region stays mounted so screen readers announce updates */}
      <div
        role="status"
        aria-atomic="true"
        className="text-muted-foreground text-sm"
      >
        <SuspenseQueryBoundary
          fallback={renderNothing}
          loadingFallback={<GamesResultsSkeleton />}
          // Each boundary has its own error state: without this, a failed
          // request leaves the count blank until reload, as the grid's
          // "retry" only resets the grid. Changing a filter clears the
          // error and refetches.
          // ⚠️ Known limitation: a retry on the grid doesn't restore the
          // count; it reappears on the next filter change.
          resetKeys={[gameQuery]}
        >
          <GamesResultsCount gameQuery={gameQuery} />
        </SuspenseQueryBoundary>
      </div>
    </div>
  )
}
