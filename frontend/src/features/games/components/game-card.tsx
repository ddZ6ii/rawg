import type { Game } from '@rawg/shared'

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  getCroppedImage,
  Skeleton,
} from '@/shared'

import noImagePlaceholder from '@/assets/no-image-placeholder.webp'

import { CriticScore } from './critic-score'
import { PlatformIconList } from './platform-icon-list'

function GameCardContainer({ children }: React.PropsWithChildren) {
  return <Card className="overflow-hidden pb-4">{children} </Card>
}

function GameCard({ game }: { game: Game }) {
  const thumbnailUrl = game.background_image
    ? getCroppedImage(game.background_image)
    : noImagePlaceholder

  const thumbnailAltText = game.background_image
    ? game.name
    : `No thumbnail available for ${game.name}`

  const handleImageError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (e.currentTarget.src !== noImagePlaceholder) {
      e.currentTarget.src = noImagePlaceholder
    }
  }

  return (
    <GameCardContainer>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={thumbnailAltText}
          width={640}
          height={360}
          className="size-full object-cover transition-transform hover:scale-105"
          onError={handleImageError}
        />
      </div>

      <CardHeader>
        <CardTitle asChild className="min-w-0 text-lg lg:text-xl">
          <h2 className="line-clamp-2 min-h-[2lh]">{game.name}</h2>
        </CardTitle>
      </CardHeader>

      <CardFooter className="-mt-2 justify-between gap-2 border-t">
        <PlatformIconList
          platforms={(game.parent_platforms ?? []).map((p) => p.platform)}
        />
        <CriticScore score={game.metacritic} />
      </CardFooter>
    </GameCardContainer>
  )
}

function GameCardSkeleton() {
  return (
    <GameCardContainer>
      <Skeleton className="aspect-video w-full" />

      <CardHeader>
        <Skeleton className="mb-2.5 h-4.5 w-1/2 lg:mb-2 lg:h-5" />
      </CardHeader>

      <CardFooter className="justify-between gap-2 border-t">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="mb-0.5 aspect-square h-5 rounded-full"
            />
          ))}
        </div>
        <Skeleton className="mb-0.5 h-5 w-8 rounded-full" />
      </CardFooter>
    </GameCardContainer>
  )
}

export { GameCard, GameCardSkeleton }
