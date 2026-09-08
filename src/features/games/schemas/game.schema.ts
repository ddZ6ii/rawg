import * as z from 'zod/mini'

const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
})

type Game = z.infer<typeof GameSchema>

export { GameSchema, type Game }
