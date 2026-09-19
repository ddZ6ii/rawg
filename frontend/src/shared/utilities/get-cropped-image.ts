const PATH = 'media/'

// width/height aren't exposed as params: RAWG's crop API is undocumented,
// so 600/400 is a value found via manual trial and error to work reliably
export function getCroppedImage(url: string): string {
  const index = url.indexOf(PATH)
  if (index === -1) return url

  const insertAt = index + PATH.length
  return `${url.slice(0, insertAt)}crop/600/400/${url.slice(insertAt)}`
}
