/**
 * Password validation constants for auth and user DTOs
 */
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  // Requires: uppercase, lowercase, digit, special char (@$!%*?&)
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  MESSAGES: {
    MIN_LENGTH: 'Password must be at least 8 characters',
    MAX_LENGTH: 'Password must not exceed 128 characters',
    PATTERN: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
  },
}
