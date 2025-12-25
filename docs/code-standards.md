# Code Standards

## Project Structure
Standard NestJS module-based structure with specialized folders for cross-cutting concerns.
- `src/common`: Global constants, DTOs, entities.
- `src/modules`: Feature-specific modules (CQRS pattern).

## Security Standards

### Password Validation
All password-related DTOs must use the centralized `PASSWORD_VALIDATION` constant from `@common/constants/password-validation.constant`.

**Enforced Rules:**
- Min: 8 chars
- Max: 128 chars
- Regex: Uppercase + Lowercase + Digit + Special Char

**Usage Example:**
```typescript
@MinLength(PASSWORD_VALIDATION.MIN_LENGTH)
@MaxLength(PASSWORD_VALIDATION.MAX_LENGTH)
@Matches(PASSWORD_VALIDATION.REGEX)
password: string
```

### Authentication
- Use `PassportStrategy` with JWT.
- **Mandatory User Check**: Strategies must verify the user still exists in the database during the `validate` lifecycle.

## API Standards
- **DTOs**: Use `class-validator` for input validation.
- **Swagger**: Use `@ApiProperty` with validation constraints (minLength, maxLength) to sync docs with implementation.
- **Casing**: Use `camelCase` for properties and `PascalCase` for classes.
