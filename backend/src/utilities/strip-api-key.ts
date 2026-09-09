// RAWG embeds the API key directly in the `next`/`previous` pagination URLs
// of its own responses (e.g. "https://api.rawg.io/api/games?key=...&page=2").
// Proxying that through unmodified would leak the real key into the browser's
// Network tab, defeating the entire point of this backend. Strip it.
export function stripApiKey(url: string | null): string | null {
  if (!url) return url
  const stripped = new URL(url)
  stripped.searchParams.delete('key')
  return stripped.toString()
}
