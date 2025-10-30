import { randomInt } from 'crypto'

export function pickOne<T>(arr: T[]): T {
  return arr[randomInt(arr.length)]
}

export function pickMany<T>(arr: T[], take?: number): T[] {
  const itemCount = arr.length

  if (!itemCount || take >= itemCount) return arr

  if (!take) {
    take = randomInt(1, itemCount)
  }

  const randomIndexSet = new Set<number>()
  while (randomIndexSet.size < take) {
    const r = randomInt(itemCount)
    randomIndexSet.add(r)
  }

  return [...randomIndexSet].map((index) => arr[index])
}
