
/** first argument is included, second is excluded */
export const range = (a: number, b?: number): Array<number> => {
  if (!b) return Array(a).fill(0).map((_, i) => i)
  return range(b! - a).map(i => i + a)
}

export const unique = (arr: any[]) => [...new Set(arr)]
