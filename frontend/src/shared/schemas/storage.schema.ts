import * as z from 'zod/mini'

import { ThemeSchema } from '@/shared/schemas/theme.schema'

const StorageSchema = z.object({
  theme: ThemeSchema,
})

type StorageSchemaType = z.infer<typeof StorageSchema>

export { StorageSchema, type StorageSchemaType }
