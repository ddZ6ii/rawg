import { Gamepad2Icon } from 'lucide-react'

import type { Game } from '@rawg/shared'

import { CriticScore } from '@/features/games/components/critic-score'
import { PlatformIconList } from '@/features/games/components/platform-icon-list'
import { getCroppedImage } from '@/features/games/utilities/get-cropped-image'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

function GameCardContainer({ children }: React.PropsWithChildren) {
  return <Card className="overflow-hidden pb-4">{children} </Card>
}

function GameCard({ game }: { game: Game }) {
  return (
    <GameCardContainer>
      {game.background_image ? (
        <img
          src={getCroppedImage(game.background_image)}
          alt={game.name}
          width={640}
          height={360}
          className="aspect-video w-full object-cover transition-transform hover:scale-105"
        />
      ) : (
        <div className="bg-muted text-muted-foreground grid aspect-video w-full place-content-center justify-items-center gap-1">
          <Gamepad2Icon className="size-8" />
          <p className="text-sm">No thumbnail available</p>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-lg lg:text-xl">{game.name}</CardTitle>
      </CardHeader>

      <CardFooter className="justify-between gap-2 border-t">
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
