import { useSuspenseQuery } from '@tanstack/react-query'
import { memo } from 'react'

import type { Genre } from '@rawg/shared'

import { GenreItem, GenreItemSkeleton } from './genre-item'
import { createGenresQueryOptions } from '@/features/genres/services'

function GenreListContainer({ children }: React.PropsWithChildren) {
  return (
    <ul className="bg-popover sticky top-4 space-y-4 rounded-md border-r p-2 shadow-lg">
      {children}
    </ul>
  )
}

const GenreList = memo(function GenreList({
  selectedGenre,
  onSelectGenre,
}: {
  selectedGenre: Genre | null
  onSelectGenre: (nextGenre: Genre) => void
}) {
  const { data: genres } = useSuspenseQuery(
    createGenresQueryOptions({ options: { ordering: 'name' } }),
  )

  if (genres.length === 0) {
    return <p className="text-muted-foreground">No genres found.</p>
  }

  return (
    <GenreListContainer>
      {genres.map((genre) => (
        <GenreItem
          key={genre.id}
          genre={genre}
          isSelected={selectedGenre?.id === genre.id}
          onClick={() => {
            onSelectGenre(genre)
          }}
        />
      ))}
    </GenreListContainer>
  )
})

function GenreListSkeleton({ length = 19 }: { length?: number }) {
  return (
    <GenreListContainer>
      {Array.from({ length }).map((_, index) => (
        <GenreItemSkeleton key={index} />
      ))}
    </GenreListContainer>
  )
}

export { GenreList, GenreListSkeleton }
