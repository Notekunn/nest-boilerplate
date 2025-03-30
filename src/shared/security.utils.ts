import * as bcrypt from 'bcryptjs'

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string, salt?: string): string {
  if (salt) {
    return bcrypt.hashSync(password, salt)
  }
  return bcrypt.hashSync(password, 10)
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
