import { randomInt } from 'crypto'

export function pickOne<T>(array: T[]): T {
  return array[randomInt(array.length)]
}

export function pickMany<T>(array: T[], take?: number): T[] {
  const itemCount = array.length

  if (!itemCount || take >= itemCount) return array

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

  return randomIndices.map((index) => array[index])
}
