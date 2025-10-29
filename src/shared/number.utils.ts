import { getRandomValues } from 'crypto'

/**
 * Internal helper to generate a random number in a range
 * @param from minimum value
 * @param to maximum value
 * @returns random number between from (inclusive) and to (exclusive)
 */
const generateRandomInRange = (from: number, to: number): number => {
  return from + (getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * (to - from)
}

/**
 * Generate a random number within a specified range
 * @param from minimum value
 * @param to maximum value
 * @returns random number between from (inclusive) and to (exclusive)
 */
export const getRandomNumber = (from: number, to: number) => {
  return generateRandomInRange(from, to)
}

/**
 * Generate a random number within a specified range with fixed decimal places
 * @param from minimum value
 * @param to maximum value
 * @param fixed number of decimal places to round to
 * @returns random number between from and to, rounded to specified decimal places
 */
export const getRandomNumberFixed = (from: number, to: number, fixed: number) => {
  const randomNumber = generateRandomInRange(from, to)
  const fixedNumber = +randomNumber.toFixed(fixed)
  return fixedNumber
}
