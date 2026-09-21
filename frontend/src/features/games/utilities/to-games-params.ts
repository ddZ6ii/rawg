import type { GamesParams } from '@rawg/shared'

import type { GameQuery } from '@/features/games/types'

export function toGamesParams(query: GameQuery): GamesParams {
  return {
    ...(query.genre && { genres: query.genre.id.toString() }),
    ...(query.platform && { parent_platforms: query.platform.id.toString() }),
    ...(query.ordering && { ordering: query.ordering }),
  }
}
