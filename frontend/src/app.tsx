import { useCallback, useState } from 'react'

import type { GamesSortOrders, Genre, Platform } from '@rawg/shared'

import { GameGrid, GameGridSkeleton, type GameQuery } from '@/features/games'
import { GenreList, GenreListSkeleton } from '@/features/genres'
import { SelectPlatform, SelectPlatformSkeleton } from '@/features/platforms'
import { SortSelector } from '@/features/sorting'
import {
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
  const [gameQuery, setGameQuery] = useState<GameQuery>({
    genre: null,
    platform: null,
    ordering: null,
  })

  const title = getPageTitle(gameQuery.genre?.name, gameQuery.platform?.name)

  const handleSelectGenre = useCallback((genre: Genre) => {
    setGameQuery((prev) => ({
      ...prev,
      genre: genre.id === prev.genre?.id ? null : genre,
    }))
  }, [])

  const handleSelectPlatform = useCallback((platform: Platform | null) => {
    setGameQuery((prev) => ({ ...prev, platform }))
  }, [])

  const handleSelectSortOrder = useCallback(
    (ordering: GamesSortOrders | null) => {
      setGameQuery((prev) => ({ ...prev, ordering }))
    },
    [],
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
              onSelectGenre={handleSelectGenre}
            />
          </SuspenseQueryBoundary>
        </aside>
      )}

      <main className="h-full min-w-0 space-y-2 lg:space-y-4">
        <div className="flex items-end justify-between gap-2">
          <TruncatedTooltip tooltip={title}>
            <h1 className="min-w-0 truncate text-xl font-semibold lg:text-2xl">
              {title}
            </h1>
          </TruncatedTooltip>

          {!isMobile && (
            <div className="flex flex-1 items-center justify-end gap-2">
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
                  onSelectPlatform={handleSelectPlatform}
                />
              </SuspenseQueryBoundary>

              <SortSelector
                sortOrder={gameQuery.ordering}
                onSelectSortOrder={handleSelectSortOrder}
              />
            </div>
          )}
        </div>

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
          <GameGrid gameQuery={gameQuery} />
        </SuspenseQueryBoundary>
      </main>
    </div>
  )
}
