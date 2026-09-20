import { MdOutlineWebAssetOff } from 'react-icons/md'

import { type Genre } from '@rawg/shared'

import { Button, cn, getCroppedImage, Skeleton } from '@/shared'

function GenreItemContainer({
  children,
  className,
  isSelected,
  onClick,
}: React.PropsWithChildren<{
  className?: string
  isSelected?: boolean
  onClick?: () => void
}>) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Button
        variant="ghost"
        data-testid="genre-item"
        data-selected={isSelected}
        className={cn(
          'text-muted-foreground hover:text-foreground w-full justify-start pl-0',
          className,
        )}
        onClick={onClick}
      >
        {children}
      </Button>
    </li>
  )
}

function GenreItem({
  genre,
  isSelected,
  onClick,
}: {
  genre: Genre
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <GenreItemContainer
      onClick={onClick}
      isSelected={isSelected}
      className={cn(isSelected && 'text-foreground bg-accent font-semibold')}
    >
      {genre.image_background ? (
        <img
          src={getCroppedImage(genre.image_background)}
          alt={genre.name}
          width={32}
          height={32}
          className="size-8 rounded-md object-cover"
        />
      ) : (
        <div className="bg-muted grid size-8 place-content-center rounded-md">
          <MdOutlineWebAssetOff className="size-4" />
        </div>
      )}

      <span>{genre.name}</span>
    </GenreItemContainer>
  )
}

function GenreItemSkeleton() {
  return (
    <GenreItemContainer>
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="h-3.5 w-1/3" />
    </GenreItemContainer>
  )
}

export { GenreItem, GenreItemSkeleton }
