import { generateHash, validateHash } from './security.utils'

describe('Security Utils', () => {
  describe('generateHash', () => {
    it('should generate hash without salt', () => {
      const password = 'testPassword123'
      const hash = generateHash(password)
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/)
    })

    it('should generate hash with provided salt', () => {
      const password = 'testPassword123'
      const salt = '$2a$10$abcdefghijklmnopqrstuv'
      const hash = generateHash(password, salt)
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/)
    })
  })

  describe('validateHash', () => {
    it('should validate correct password', async () => {
      const password = 'testPassword123'
      const hash = generateHash(password)
      const isValid = await validateHash(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const hash = generateHash(password)
      const isValid = await validateHash('wrongPassword', hash)
      expect(isValid).toBe(false)
    })

    it('should handle empty hash', async () => {
      const isValid = await validateHash('testPassword123', '')
      expect(isValid).toBe(false)
    })
  })
})
