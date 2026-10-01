import type { GamesSortOrders, Platform } from '@rawg/shared'

import type { GameQuery } from '@/features/games'
import { SelectPlatform, SelectPlatformSkeleton } from '@/features/platforms'
import { SearchInput } from '@/features/search'
import { SortSelector } from '@/features/sorting'
import { SuspenseQueryBoundary, WidgetErrorFallback } from '@/shared'

export function GamesFilters({
  gameQuery,
  isPending,
  onSearch,
  onSelectPlatform,
  onSelectSortOrder,
}: {
  gameQuery: GameQuery
  isPending: boolean
  onSearch: (search: string | null) => void
  onSelectPlatform: (platform: Platform | null) => void
  onSelectSortOrder: (ordering: GamesSortOrders | null) => void
}) {
  return (
    <div className="flex items-start justify-end gap-2">
      <SearchInput isPending={isPending} onSearch={onSearch} />

      <SuspenseQueryBoundary
        fallback={(props) => (
          <WidgetErrorFallback
            {...props}
            message="Couldn't load platforms."
            className="mr-2 self-end text-sm"
          />
        )}
        loadingFallback={<SelectPlatformSkeleton />}
      >
        <SelectPlatform
          selectedPlatform={gameQuery.platform}
          onSelectPlatform={onSelectPlatform}
        />
      </SuspenseQueryBoundary>

      <SortSelector
        sortOrder={gameQuery.ordering}
        onSelectSortOrder={onSelectSortOrder}
      />
    </div>
  )
}
