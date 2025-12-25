# Phase 4: API/Cleanup

## Context

- **Priority**: P2 (Medium)
- **Status**: Pending
- **Effort**: 1h
- **Commit**: `refactor(auth): rename expiresIn to expiresAt and cleanup`

## Overview

API improvements and code cleanup:
- Rename `expiresIn` → `expiresAt` (semantic correctness)
- Remove stale TODO comment
- Remove unnecessary token verify after sign

## Key Insights

- `expiresIn` implies duration but stores timestamp → confusing
- TODO comment outdated - roles already implemented
- Verifying token immediately after signing is wasteful

## Breaking Changes

| Change | Impact |
|--------|--------|
| `expiresIn` → `expiresAt` | Frontend API response structure changes |

**Migration**: Notify frontend team before deploy

## Related Code Files

| Action | File |
|--------|------|
| Modify | `src/modules/auth/dto/token-response.dto.ts` |
| Modify | `src/modules/auth/dto/jwt-claims.dto.ts` |
| Modify | `src/modules/auth/cqrs/commands/handler/create-token.handler.ts` |

## Implementation Steps

### Step 1: Rename expiresIn to expiresAt

**File**: `src/modules/auth/dto/token-response.dto.ts`

**Before**:
```typescript
import { ApiProperty } from '@nestjs/swagger'

export class TokenResponseDto {
  @ApiProperty()
  token: string

  @ApiProperty()
  expiresIn: Date

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial)
  }
}
```

**After**:
```typescript
import { ApiProperty } from '@nestjs/swagger'

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  token: string

  @ApiProperty({ description: 'Token expiration timestamp' })
  expiresAt: Date

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial)
  }
}
```

### Step 2: Remove Stale TODO

**File**: `src/modules/auth/dto/jwt-claims.dto.ts`

**Before**:
```typescript
import { Roles } from '@common/enum/role.enum'
import { ApiProperty } from '@nestjs/swagger'

export class JwtClaimsDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  //TODO: add roles
  @ApiProperty({
    enum: Roles,
    isArray: true,
  })
  roles: Roles[]
}
```

**After**:
```typescript
import { Roles } from '@common/enum/role.enum'
import { ApiProperty } from '@nestjs/swagger'

export class JwtClaimsDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  @ApiProperty({
    enum: Roles,
    isArray: true,
  })
  roles: Roles[]
}
```

**Change**: Remove line 11 (`//TODO: add roles`)

### Step 3: Optimize Token Handler

**File**: `src/modules/auth/cqrs/commands/handler/create-token.handler.ts`

**Before**:
```typescript
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'

import { CreateTokenCommand } from '../impl/create-token.command'

@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(private readonly jwtService: JwtService) {}
  async execute(command: CreateTokenCommand) {
    const { user } = command
    const { id, email, role } = user

    const token = this.jwtService.sign({
      id,
      email,
      roles: [role],
    })
    const { exp } = this.jwtService.verify(token)

    return new TokenResponseDto({
      token,
      expiresIn: new Date(exp * 1000),
    })
  }
}
```

**After**:
```typescript
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'

import { CreateTokenCommand } from '../impl/create-token.command'

@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: CreateTokenCommand) {
    const { user } = command
    const { id, email, role } = user

    const token = this.jwtService.sign({
      id,
      email,
      roles: [role],
    })

    // Decode token to get expiry instead of verifying (already valid, we just signed it)
    const decoded = this.jwtService.decode(token) as { exp: number }
    const expiresAt = new Date(decoded.exp * 1000)

    return new TokenResponseDto({
      token,
      expiresAt,
    })
  }
}
```

**Changes**:
- Line 19-20: Replace `verify()` with `decode()` (no crypto verification needed)
- Line 21: Extract expiry directly
- Line 25: Rename `expiresIn` → `expiresAt`

**Alternative** (compute from config - no decode needed):
```typescript
// If you know the expiry config, compute directly:
const expiryMs = 7 * 24 * 60 * 60 * 1000 // 7 days
const expiresAt = new Date(Date.now() + expiryMs)
```

## Todo List

- [ ] Rename expiresIn → expiresAt in token-response.dto.ts
- [ ] Add descriptions to ApiProperty decorators
- [ ] Remove TODO comment from jwt-claims.dto.ts
- [ ] Replace verify() with decode() in create-token.handler.ts
- [ ] Update field name in TokenResponseDto constructor call
- [ ] Run tests to verify

## Success Criteria

- [ ] API response has `expiresAt` field (not `expiresIn`)
- [ ] No TODO comments in jwt-claims.dto.ts
- [ ] Token handler uses decode() not verify()
- [ ] All existing tests pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Frontend breaks | High | Medium | Coordinate with frontend team |
| Test failures | Medium | Low | Update test assertions if needed |

## Security Considerations

- `decode()` doesn't verify signature - safe here since we just signed it
- No security degradation, only performance improvement

## Next Steps

After this phase:
1. Run `pnpm test` to verify
2. Update API docs if separate from code
3. Notify frontend team of `expiresIn` → `expiresAt` change
4. Commit: `refactor(auth): rename expiresIn to expiresAt and cleanup`
5. Proceed to Phase 5
