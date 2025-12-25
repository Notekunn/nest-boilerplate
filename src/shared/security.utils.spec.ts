import { generateHash, validateHash } from './security.utils'

describe('Security Utils', () => {
  describe('generateHash', () => {
    it('should generate a valid bcrypt hash', async () => {
      const password = 'testPassword123!'
      const hash = await generateHash(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.startsWith('$2')).toBe(true) // bcrypt prefix
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123!'
      const hash1 = await generateHash(password)
      const hash2 = await generateHash(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should generate hash that validates correctly', async () => {
      const password = 'testPassword123!'
      const hash = await generateHash(password)
      const isValid = await validateHash(password, hash)

      expect(isValid).toBe(true)
    })

    it('should use custom salt rounds', async () => {
      const password = 'testPassword123!'
      const hash = await generateHash(password, 4) // lower cost for test speed

      expect(hash).toBeDefined()
      const isValid = await validateHash(password, hash)
      expect(isValid).toBe(true)
    })
  })

  describe('validateHash', () => {
    it('should validate correct password', async () => {
      const password = 'testPassword123!'
      const hash = await generateHash(password)
      const isValid = await validateHash(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123!'
      const hash = await generateHash(password)
      const isValid = await validateHash('wrongPassword', hash)
      expect(isValid).toBe(false)
    })

    it('should handle empty hash', async () => {
      const isValid = await validateHash('testPassword123!', '')
      expect(isValid).toBe(false)
    })
  })
})
