export { InvalidInputError } from './errors/invalid-input.error.js'

export {
  GAMES_SORT_ORDERS,
  GamesSortOrdersSchema,
  GamesParamsSchema,
  GameSchema,
  type Game,
  type GamesPaginatedResponse,
  type GamesParams,
  type GamesSortOrders,
} from './schemas/game.schema.js'

export {
  GenreSchema,
  GenresParamsSchema,
  type Genre,
  type GenresPaginatedResponse,
  type GenresParams,
} from './schemas/genre.schema.js'

export {
  PaginatedResponseSchema,
  type PaginatedResponse,
} from './schemas/paginated-response.schema.js'

export {
  PlatformSchema,
  PlatformsParamsSchema,
  type Platform,
  type PlatformsPaginatedResponse,
  type PlatformsParams,
} from './schemas/platform.schema.js'
