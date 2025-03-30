import { pickMany, pickOne } from './array.utils'

describe('Array Utils', () => {
  const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  describe('pickOne', () => {
    it('should return one element from array', () => {
      const result = pickOne(testArray)
      expect(testArray).toContain(result)
      expect(typeof result).toBe('number')
    })
  })

  describe('pickMany', () => {
    it('should return specified number of elements', () => {
      const take = 3
      const result = pickMany(testArray, take)
      expect(result).toHaveLength(take)
      for (const item of result) expect(testArray).toContain(item)
    })

    it('should return random number of elements when take is not specified', () => {
      const result = pickMany(testArray)
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(testArray.length)
      for (const item of result) expect(testArray).toContain(item)
    })

    it('should return all elements when take is greater than array length', () => {
      const result = pickMany(testArray, 10)
      expect(result).toHaveLength(testArray.length)
      expect(result).toEqual([...testArray])
    })
  })
})
