import { useState } from 'react'

import type { Genre, Platform } from '@rawg/shared'

import { GameGrid, GameGridSkeleton } from '@/features/games/components'
import { GenreList, GenreListSkeleton } from '@/features/genres/components'
import {
  SelectPlatform,
  SelectPlatformSkeleton,
} from '@/features/platforms/components'
import {
  NavBar,
  SelectTheme,
  SuspenseQueryBoundary,
  TruncatedTooltip,
  WidgetErrorFallback,
} from '@/shared/components'
import { useIsMobile } from '@/shared/hooks'
import { getPageTitle } from '@/shared/utilities'

export default function App() {
  const isMobile = useIsMobile()
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  )

  const title = getPageTitle(selectedGenre?.name, selectedPlatform?.name)

  const toggleSelectedGenre = (genre: Genre) => {
    setSelectedGenre(genre.id === selectedGenre?.id ? null : genre)
  }

  return (
    <div className="relative container mx-auto grid min-h-dvh grid-rows-[auto_1fr] gap-x-4 gap-y-2 p-2 lg:grid-cols-[220px_4fr] lg:px-4">
      <header className="flex items-center justify-between gap-3 lg:col-span-2 lg:pl-2">
        <NavBar />
        <SelectTheme />
      </header>

      {!isMobile && (
        <aside>
          <SuspenseQueryBoundary
            fallback={(props) => (
              <WidgetErrorFallback className="justify-items-start" {...props} />
            )}
            loadingFallback={<GenreListSkeleton />}
          >
            <GenreList
              selectedGenre={selectedGenre}
              onSelectGenre={toggleSelectedGenre}
            />
          </SuspenseQueryBoundary>
        </aside>
      )}

      <main className="h-full min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <TruncatedTooltip tooltip={title}>
            <h1 className="min-w-0 truncate text-xl font-semibold lg:text-2xl">
              {title}
            </h1>
          </TruncatedTooltip>
          {!isMobile && (
            <SuspenseQueryBoundary
              fallback={(props) => (
                <WidgetErrorFallback
                  {...props}
                  message="Couldn't load platforms."
                  className="text-muted-foreground text-sm"
                />
              )}
              loadingFallback={<SelectPlatformSkeleton />}
            >
              <SelectPlatform
                selectedPlatform={selectedPlatform}
                onSelectPlatform={setSelectedPlatform}
              />
            </SuspenseQueryBoundary>
          )}
        </div>

        <SuspenseQueryBoundary
          fallback={(props) => (
            <WidgetErrorFallback
              className="h-full justify-items-center"
              {...props}
            />
          )}
          loadingFallback={<GameGridSkeleton />}
        >
          <GameGrid
            selectedGenreId={selectedGenre?.id}
            selectedPlatformId={selectedPlatform?.id}
          />
        </SuspenseQueryBoundary>
      </main>
    </div>
  )
}
