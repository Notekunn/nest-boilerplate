import { randomBytes } from 'crypto'

/**
 * Normalize sort type
 * @param sortType string
 * @returns 'ASC' | 'DESC'
 */
export function normalizeSortType(sortType?: string): 'ASC' | 'DESC' {
  if (sortType && ['ASC', 'DESC', 'asc', 'desc'].includes(sortType)) {
    return sortType.toUpperCase() as 'ASC' | 'DESC'
  }

  return 'ASC'
}

export function getRandomString(length: number): string {
  return randomBytes(length).toString('hex').slice(0, length)
}

/**
 *
 * @param enumeration enum variable
 * @param value string
 * @returns Enum
 */
export function enumFromStringValue<T>(enumeration: { [s: string]: T }, value: string): T | undefined {
  return (Object.values(enumeration) as unknown as string[]).includes(value) ? (value as unknown as T) : undefined
}
