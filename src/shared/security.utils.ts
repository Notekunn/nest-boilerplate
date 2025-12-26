import * as bcrypt from 'bcryptjs'

/** Default number of salt rounds for bcrypt hashing */
const DEFAULT_SALT_ROUNDS = 10

/**
 * Generate hash from password asynchronously
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Promise resolving to hashed password
 */
export async function generateHash(password: string, saltRounds: number = DEFAULT_SALT_ROUNDS): Promise<string> {
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
