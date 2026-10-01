import type { Genre } from '@rawg/shared'

import { GenreList, GenreListSkeleton } from '@/features/genres'
import { SuspenseQueryBoundary, WidgetErrorFallback } from '@/shared'

export function GenresPanel({
  selectedGenre,
  onSelectGenre,
}: {
  selectedGenre: Genre | null
  onSelectGenre: (genre: Genre) => void
}) {
  return (
    <>
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
          selectedGenre={selectedGenre}
          onSelectGenre={onSelectGenre}
        />
      </SuspenseQueryBoundary>
    </>
  )
}
