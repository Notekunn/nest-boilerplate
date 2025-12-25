# Phase 1: Security Fixes

## Context

- **Priority**: P1 (Critical)
- **Status**: Done (2025-12-25)
- **Effort**: 1h
- **Commit**: `fix(auth): add password validation and JWT null check`

## Overview

Fix critical security vulnerabilities: missing password validation allows weak/empty passwords, missing JWT null check allows deleted users to access protected resources.

## Requirements

### Password Validation (Register)
- Min 8 chars, max 128 chars
- Must contain: uppercase, lowercase, number, special char
- Clear validation error message

### Password Validation (Login)
- Max 128 chars only (DoS prevention)
- No complexity check (existing users may have weak passwords)

### JWT Null Check
- Throw 401 if user not found after JWT validation
- Prevents deleted user access with valid token

## Related Code Files

| Action | File |
|--------|------|
| Modify | `src/modules/auth/dto/register-by-email.dto.ts` |
| Modify | `src/modules/auth/dto/login-by-email.dto.ts` |
| Modify | `src/modules/auth/jwt.strategy.ts` |

## Implementation Steps

### Step 1: Update RegisterByEmailDto

**File**: `src/modules/auth/dto/register-by-email.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    { message: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)' }
  )
  @ApiProperty({ minLength: 8, maxLength: 128 })
  password: string
}
```

### Step 2: Update LoginByEmailDto

**File**: `src/modules/auth/dto/login-by-email.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength } from 'class-validator'

export class LoginByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @ApiProperty({ maxLength: 128 })
  password: string
}
```

### Step 3: Add JWT Null Check

**File**: `src/modules/auth/jwt.strategy.ts`

```typescript
import { GetUserByIdQuery } from '@modules/users/cqrs/queries/impl/get-user-by-id.query'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QueryBus } from '@nestjs/cqrs'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtClaimsDto } from './dto/jwt-claims.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    public readonly configService: ConfigService,
    private readonly queryBus: QueryBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.secret'),
    })
  }

  async validate({ id: userId }: { id: number }): Promise<JwtClaimsDto> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(userId))

    if (!user) {
      throw new UnauthorizedException()
    }

    return { ...user, roles: [user.role] }
  }
}
```

## Todo List

- [x] Add MinLength, MaxLength, Matches to register-by-email.dto.ts
- [x] Add MaxLength to login-by-email.dto.ts
- [x] Add UnauthorizedException import to jwt.strategy.ts
- [x] Add null check in jwt.strategy.ts validate method
- [x] Run existing tests to verify no regression

## Success Criteria

- [x] `POST /auth/register` with weak password returns 400
- [x] `POST /auth/register` with empty password returns 400
- [x] `POST /auth/register` with 150 char password returns 400
- [x] `POST /auth/login` with 150 char password returns 400
- [x] JWT for deleted user returns 401
- [x] All existing tests pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regex too strict | Medium | Users cant register | Provide examples in error message |
| Breaking existing sessions | Low | Logged out | JWT secret unchanged, only validates user exists |

## Security Considerations

- Password regex prevents common attack patterns
- MaxLength prevents bcrypt DoS (72 byte limit)
- Null check prevents privilege persistence after user deletion

## Next Steps

After this phase:
1. Run `pnpm test` to verify
2. Commit: `fix(auth): add password validation and JWT null check`
3. Proceed to Phase 2
