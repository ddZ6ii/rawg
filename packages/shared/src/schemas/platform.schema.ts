import * as z from 'zod/mini'

const ParentPlatformSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

type Platform = z.infer<typeof ParentPlatformSchema>

export { ParentPlatformSchema, type Platform }
