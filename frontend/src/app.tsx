import { useState } from 'react'

import type { Genre } from '@rawg/shared'

import { GameGrid, GameGridSkeleton } from '@/features/games/components'
import { GenreList, GenreListSkeleton } from '@/features/genres/components'
import {
  NavBar,
  SelectTheme,
  SuspenseQueryBoundary,
  WidgetErrorFallback,
} from '@/shared/components'

export default function App() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)

  const handleSelectGenre = (genre: Genre) => {
    if (selectedGenre?.id === genre.id) {
      setSelectedGenre(null)
    } else {
      setSelectedGenre(genre)
    }
  }

  return (
    <div className="relative container mx-auto grid min-h-dvh grid-rows-[auto_1fr] gap-x-4 gap-y-2 p-2 lg:grid-cols-[220px_4fr] lg:px-4">
      <header className="flex items-center justify-between gap-3 lg:col-span-2 lg:pl-2">
        <NavBar />
        <SelectTheme />
      </header>

      <aside className="hidden lg:block">
        <SuspenseQueryBoundary
          fallback={(props) => (
            <WidgetErrorFallback className="justify-items-start" {...props} />
          )}
          loadingFallback={<GenreListSkeleton />}
        >
          <GenreList
            selectedGenre={selectedGenre}
            onSelectGenre={handleSelectGenre}
          />
        </SuspenseQueryBoundary>
      </aside>

      <main className="h-full">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold lg:text-2xl">
            {selectedGenre ? selectedGenre.name : 'All Games'}{' '}
          </h1>
          <SuspenseQueryBoundary
            fallback={(props) => (
              <WidgetErrorFallback
                className="h-full justify-items-center"
                {...props}
              />
            )}
            loadingFallback={<GameGridSkeleton />}
          >
            <GameGrid selectedGenre={selectedGenre} />
          </SuspenseQueryBoundary>
        </div>
      </main>
    </div>
  )
}
