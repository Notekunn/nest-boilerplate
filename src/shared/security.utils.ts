import * as bcrypt from 'bcryptjs'

/**
 * Generate hash from password asynchronously
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Promise resolving to hashed password
 */
export async function generateHash(password: string, saltRounds: number = 10): Promise<string> {
  return bcrypt.hash(password, saltRounds)
}

/**
 * Validate text with hash
 * @param password - Plain text password
 * @param hash - Hashed password to compare against
 * @returns Promise resolving to true if match
 */
export function validateHash(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash || '')
}
