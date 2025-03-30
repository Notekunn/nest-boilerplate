import { getRandomNumber, getRandomNumberFixed } from './number.utils'

describe('NumberUtils', () => {
  describe('getRandomNumber', () => {
    it('should return number within range', () => {
      const from = 1
      const to = 10
      const result = getRandomNumber(from, to)

      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    })

    it('should handle negative numbers', () => {
      const from = -10
      const to = -1
      const result = getRandomNumber(from, to)

      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    })
  })

  describe('getRandomNumberFixed', () => {
    it('should return number with correct decimal places', () => {
      const from = 1
      const to = 10
      const fixed = 2
      const result = getRandomNumberFixed(from, to, fixed)
      expect(result.toString()).toMatch(/^\d+\.\d{2}$/)
      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    })

    it('should handle zero decimal places', () => {
      const from = 1
      const to = 10
      const fixed = 0
      const result = getRandomNumberFixed(from, to, fixed)

      expect(Number.isInteger(result)).toBe(true)
      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    })

    it('should handle negative numbers with decimals', () => {
      const from = -10
      const to = -1
      const fixed = 1
      const result = getRandomNumberFixed(from, to, fixed)

      expect(result.toString()).toMatch(/^-\d+\.\d{1}$/)
      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    })
  })
})
