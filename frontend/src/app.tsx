import { GameGrid, GameGridSkeleton, useGameQuery } from '@/features/games'
import { GenreList, GenreListSkeleton } from '@/features/genres'
import { SelectPlatform, SelectPlatformSkeleton } from '@/features/platforms'
import { SearchInput } from '@/features/search'
import { SortSelector } from '@/features/sorting'
import {
  cn,
  getPageTitle,
  NavBar,
  SelectTheme,
  SuspenseQueryBoundary,
  TruncatedTooltip,
  useIsMobile,
  WidgetErrorFallback,
} from '@/shared'

export function App() {
  const isMobile = useIsMobile()
  const {
    gameQuery,
    deferredGameQuery,
    isPending,
    selectGenre,
    selectPlatform,
    selectSortOrder,
    setSearch,
  } = useGameQuery()

  const title = getPageTitle(
    deferredGameQuery.genre?.name,
    deferredGameQuery.platform?.name,
    deferredGameQuery.search,
  )

  return (
    <div className="relative container mx-auto grid min-h-dvh grid-rows-[auto_1fr] gap-x-4 gap-y-2 p-2 lg:grid-cols-[220px_4fr] lg:gap-y-4 lg:px-4">
      <header className="flex items-center justify-between gap-3 lg:col-span-2 lg:pl-2">
        <NavBar />
        <SelectTheme />
      </header>

      {!isMobile && (
        <aside>
          <h2 className="pl-2 text-lg font-semibold">Genres</h2>

          <SuspenseQueryBoundary
            fallback={(props) => (
              <WidgetErrorFallback
                message="Couldn't load genres."
                className="mt-1 pl-2 text-sm"
                {...props}
              />
            )}
            loadingFallback={<GenreListSkeleton />}
          >
            <GenreList
              selectedGenre={gameQuery.genre}
              onSelectGenre={selectGenre}
            />
          </SuspenseQueryBoundary>
        </aside>
      )}

      <main className="flex h-full min-w-0 flex-col gap-2 lg:gap-4">
        {!isMobile && (
          <div className="flex items-start justify-end gap-2">
            <SearchInput isPending={isPending} onSearch={setSearch} />

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
                onSelectPlatform={selectPlatform}
              />
            </SuspenseQueryBoundary>

            <SortSelector
              sortOrder={gameQuery.ordering}
              onSelectSortOrder={selectSortOrder}
            />
          </div>
        )}

        <TruncatedTooltip tooltip={title}>
          <h1 className="min-w-0 truncate text-xl font-semibold lg:text-2xl">
            {title}
          </h1>
        </TruncatedTooltip>

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
          >
            <GameGrid gameQuery={deferredGameQuery} />
          </SuspenseQueryBoundary>
        </div>
      </main>
    </div>
  )
}
