import { Gamepad2Icon } from 'lucide-react'

import type { Game } from '@rawg/shared'

import PlatformIconList from '@/features/games/components/platform-icon-list'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

export function GameCard({ game }: { game: Game }) {
  return (
    <Card className="overflow-hidden pb-4">
      {game.background_image ? (
        <img
          src={game.background_image}
          alt={game.name}
          width={640}
          height={360}
          className="aspect-video w-full transition-transform hover:scale-105"
        />
      ) : (
        <div className="bg-muted text-muted-foreground grid aspect-video w-full place-content-center justify-items-center gap-1">
          <Gamepad2Icon className="size-8" />
          <p className="text-sm">No thumbnail available</p>
        </div>
      )}

      <CardHeader>
        <CardTitle className="lg:text-xl">{game.name}</CardTitle>
      </CardHeader>

      <CardFooter className="border-t">
        <PlatformIconList
          platforms={(game.parent_platforms ?? []).map((p) => p.platform)}
        />
      </CardFooter>
    </Card>
  )
}
