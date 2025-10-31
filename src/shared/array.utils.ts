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

  const randomIndices: number[] = []
  while (randomIndices.length < take) {
    const randomIndex = randomInt(itemCount)
    if (!randomIndices.includes(randomIndex)) {
      randomIndices.push(randomIndex)
    }
  }

  return randomIndices.map((index) => arr[index])
}
