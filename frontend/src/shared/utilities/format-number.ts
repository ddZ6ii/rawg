export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  // `undefined` locale → user's system locale
  return new Intl.NumberFormat(undefined, options).format(value)
}
