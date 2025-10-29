import { getRandomValues } from 'crypto'

/**
 * Internal helper to generate a random number in a range
 * @param from minimum value (inclusive)
 * @param to maximum value (inclusive)
 * @returns random number between from and to
 */
const generateRandomInRange = (from: number, to: number): number => {
  return from + (getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * (to - from)
}

export const getRandomNumber = (from: number, to: number) => {
  return generateRandomInRange(from, to)
}

export const getRandomNumberFixed = (from: number, to: number, fixed: number) => {
  const randomNumber = generateRandomInRange(from, to)
  const fixedNumber = +randomNumber.toFixed(fixed)
  return fixedNumber
}
