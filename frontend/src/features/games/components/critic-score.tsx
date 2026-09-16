import type { Game } from '@rawg/shared'

import { Badge } from '@/shared/components/ui/badge'

export function CriticScore({ score }: { score: Game['metacritic'] }) {
  if (score === null) return null

  const scoreVariant =
    score >= 75 ? 'success' : score >= 60 ? 'warning' : 'destructive'

  return <Badge variant={scoreVariant}>{score}</Badge>
}
