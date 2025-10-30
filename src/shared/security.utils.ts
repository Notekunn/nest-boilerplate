import * as bcrypt from 'bcryptjs'

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function generateHash(password: string, salt?: string): Promise<string> {
  if (salt) {
    return bcrypt.hash(password, salt)
  }
  return bcrypt.hash(password, 10)
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash || '')
}
