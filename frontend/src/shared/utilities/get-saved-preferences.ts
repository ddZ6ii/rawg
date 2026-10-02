import { StorageSchema, type StorageSchemaType } from '@/shared/schemas'

export function getSavedPreferences(
  storageKey: string,
): StorageSchemaType | null {
  try {
    const storage = localStorage.getItem(storageKey)
    if (!storage) return null

    const parsed = StorageSchema.safeParse(JSON.parse(storage))

    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
