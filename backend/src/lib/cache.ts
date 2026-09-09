import { LRUCache } from 'lru-cache'

export const cache = new LRUCache<string, object>({
  max: 500,
  ttl: 1000 * 60 * 10, // 10 minutes
})
