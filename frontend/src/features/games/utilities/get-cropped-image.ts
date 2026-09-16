const PATH = 'media/'

export function getCroppedImage(url: string): string {
  const index = url.indexOf(PATH)
  if (index === -1) return url

  const insertAt = index + PATH.length
  return `${url.slice(0, insertAt)}crop/600/400/${url.slice(insertAt)}`
}
