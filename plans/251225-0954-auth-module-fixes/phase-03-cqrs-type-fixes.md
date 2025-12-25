# Phase 3: CQRS/Type Fixes

## Context

- **Priority**: P2 (Medium)
- **Status**: Pending
- **Effort**: 1h
- **Commit**: `fix(auth): correct CQRS base class and add type safety`

## Overview

Fix CQRS pattern violations and add type safety:
- `LoginByEmailCommand` extends `Query` instead of `Command`
- `auth.controller.ts` has implicit `any` on request
- (Already fixed in Phase 2) Register handler missing interface

## Key Insights

- Login validates password = side effect = Command, not Query
- `@nestjs-architects/typed-cqrs` exports both `Command` and `Query`
- Fastify request type needs intersection with user property

## Related Code Files

| Action | File |
|--------|------|
| Modify | `src/modules/auth/cqrs/commands/impl/login-by-email.command.ts` |
| Modify | `src/modules/auth/controllers/auth.controller.ts` |

## Implementation Steps

### Step 1: Fix LoginByEmailCommand Base Class

**File**: `src/modules/auth/cqrs/commands/impl/login-by-email.command.ts`

**Before**:
```typescript
import { UserEntity } from '@modules/users/entities/user.entity'
import { Query } from '@nestjs-architects/typed-cqrs'

export class LoginByEmailCommand extends Query<UserEntity> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super()
  }
}
```

**After**:
```typescript
import { UserEntity } from '@modules/users/entities/user.entity'
import { Command } from '@nestjs-architects/typed-cqrs'

export class LoginByEmailCommand extends Command<UserEntity> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super()
  }
}
```

**Change**: Line 2 - import `Command` instead of `Query`

### Step 2: Add Request Type to Controller

**File**: `src/modules/auth/controllers/auth.controller.ts`

**Before**:
```typescript
import { LocalAuthGuard } from '@guards/local-auth.guard'
import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateTokenCommand } from '../cqrs/commands/impl/create-token.command'
import { RegisterByEmailCommand } from '../cqrs/commands/impl/register-by-email.command'
import { LoginByEmailDto } from '../dto/login-by-email.dto'
import { LoginResponseDto } from '../dto/login-response.dto'
import { RegisterByEmailDto } from '../dto/register-by-email.dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginByEmailDto })
  @ApiResponse({
    type: LoginResponseDto,
    status: 200,
  })
  @HttpCode(200)
  @Post('login')
  async login(@Request() req) {
    const user = req.user
    const token = await this.commandBus.execute(new CreateTokenCommand(user))

    return { user, token }
  }

  // ... register method
}
```

**After**:
```typescript
import { LocalAuthGuard } from '@guards/local-auth.guard'
import { UserEntity } from '@modules/users/entities/user.entity'
import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'

import { CreateTokenCommand } from '../cqrs/commands/impl/create-token.command'
import { RegisterByEmailCommand } from '../cqrs/commands/impl/register-by-email.command'
import { LoginByEmailDto } from '../dto/login-by-email.dto'
import { LoginResponseDto } from '../dto/login-response.dto'
import { RegisterByEmailDto } from '../dto/register-by-email.dto'

/** Request with authenticated user attached by Passport */
type AuthenticatedRequest = FastifyRequest & { user: UserEntity }

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginByEmailDto })
  @ApiResponse({
    type: LoginResponseDto,
    status: 200,
  })
  @HttpCode(200)
  @Post('login')
  async login(@Request() req: AuthenticatedRequest) {
    const user = req.user
    const token = await this.commandBus.execute(new CreateTokenCommand(user))

    return { user, token }
  }

  @Post('register')
  @ApiResponse({
    type: LoginResponseDto,
    status: 201,
  })
  @HttpCode(201)
  async register(@Body() dto: RegisterByEmailDto) {
    const user = await this.commandBus.execute(new RegisterByEmailCommand(dto))
    const token = await this.commandBus.execute(new CreateTokenCommand(user))

    return { user, token }
  }
}
```

**Changes**:
- Line 2: Add `UserEntity` import
- Line 6: Add `FastifyRequest` import
- Line 14-15: Add `AuthenticatedRequest` type alias
- Line 30: Add type annotation `req: AuthenticatedRequest`

## Todo List

- [ ] Change `Query` to `Command` in login-by-email.command.ts
- [ ] Add UserEntity import to auth.controller.ts
- [ ] Add FastifyRequest import to auth.controller.ts
- [ ] Add AuthenticatedRequest type alias
- [ ] Add type annotation to login method parameter
- [ ] Run tests to verify

## Success Criteria

- [ ] No TypeScript errors
- [ ] `req.user` has proper type (UserEntity)
- [ ] LoginByEmailCommand extends Command
- [ ] All existing tests pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking CQRS handler | Low | Medium | Handler decorated correctly, just base class semantics |
| Type mismatch | Low | Low | TypeScript will catch |

## Security Considerations

- No security impact - pure type/semantic fixes
- Improves code quality and maintainability

## Next Steps

After this phase:
1. Run `pnpm test` to verify
2. Commit: `fix(auth): correct CQRS base class and add type safety`
3. Proceed to Phase 4
