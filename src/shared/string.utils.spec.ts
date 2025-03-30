import { enumFromStringValue, getRandomString, normalizeSortType } from './string.utils'

describe('String Utils', () => {
  describe('normalizeSortType', () => {
    it('should return ASC when no sort type provided', () => {
      expect(normalizeSortType()).toBe('ASC')
    })

    it('should normalize uppercase sort types', () => {
      expect(normalizeSortType('ASC')).toBe('ASC')
      expect(normalizeSortType('DESC')).toBe('DESC')
    })

    it('should normalize lowercase sort types', () => {
      expect(normalizeSortType('asc')).toBe('ASC')
      expect(normalizeSortType('desc')).toBe('DESC')
    })

    it('should return ASC for invalid sort type', () => {
      expect(normalizeSortType('invalid')).toBe('ASC')
    })
  })

  describe('getRandomString', () => {
    it('should return string of specified length', () => {
      const length = 10
      const result = getRandomString(length)
      expect(result).toHaveLength(length)
      expect(typeof result).toBe('string')
    })

    it('should return different strings on multiple calls', () => {
      const length = 10
      const result1 = getRandomString(length)
      const result2 = getRandomString(length)
      expect(result1).not.toBe(result2)
    })
  })

  describe('enumFromStringValue', () => {
    enum TestEnum {
      A = 'A',
      B = 'B',
      C = 'C',
    }

    it('should return enum value for valid string', () => {
      expect(enumFromStringValue(TestEnum, 'A')).toBe(TestEnum.A)
      expect(enumFromStringValue(TestEnum, 'B')).toBe(TestEnum.B)
    })

    it('should return undefined for invalid string', () => {
      expect(enumFromStringValue(TestEnum, 'D')).toBeUndefined()
      expect(enumFromStringValue(TestEnum, '')).toBeUndefined()
    })
  })
})
