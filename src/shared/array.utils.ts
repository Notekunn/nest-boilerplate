import { randomInt } from 'crypto'

export function pickOne<T>(arr: T[]): T {
  return arr[randomInt(arr.length)]
}

export function pickMany<T>(arr: T[], take?: number): T[] {
  const itemCount = arr.length
  if (!take) {
    take = randomInt(itemCount)
  }

  if (take >= itemCount) return arr

  const randomIndex: number[] = []
  while (randomIndex.length < take) {
    const r = randomInt(itemCount)
    if (!randomIndex.includes(r)) {
      randomIndex.push(r)
    }
  }

  return randomIndex.map((index) => arr[index])
}
