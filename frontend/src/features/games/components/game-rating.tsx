import type { Game } from '@rawg/shared'

import { Badge, cn } from '@/shared'

type Label = {
  text: string
  emoji: string
}

const RATING_LABELS: Record<number, Label> = {
  1: { text: 'Skip', emoji: '👎' },
  3: { text: 'Meh', emoji: '🤔' },
  4: { text: 'Recommended', emoji: '👍' },
  5: { text: 'Exceptional', emoji: '⭐️' },
}

export function GameRating({
  className,
  rating,
}: {
  className?: string
  rating: Game['rating_top']
}) {
  const label = rating ? RATING_LABELS[rating] : undefined
  if (!label) return null

  return (
    <Badge
      className={cn(
        'bg-background/60 text-foreground/90 border text-xs backdrop-blur-sm',
        className,
      )}
    >
      {label.text} <span aria-hidden>{label.emoji}</span>
    </Badge>
  )
}
