# Phase 5: Unit Tests

## Context

- **Priority**: P2 (Medium)
- **Status**: Pending
- **Effort**: 45m
- **Commit**: `test(auth): add unit tests for register handler`

## Overview

Add unit test for untested auth component:
- `RegisterByEmailCommandHandler` - user creation, conflict handling, password hashing

**Validation Decision**: Reduced scope to register handler only. Strategy tests deferred.

## Key Insights

- Current coverage: 50% of handlers/strategies
- Register handler is most critical - handles user creation
- Follow existing test patterns in codebase

## Related Code Files

| Action | File |
|--------|------|
| Create | `src/modules/auth/cqrs/commands/handler/register-by-email.handler.spec.ts` |

## Implementation Steps

### Step 1: Create RegisterByEmailHandler Tests

**File**: `src/modules/auth/cqrs/commands/handler/register-by-email.handler.spec.ts`

```typescript
import { UserEntity } from '@modules/users/entities/user.entity'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { ConflictException } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import * as securityUtils from '@shared/security.utils'

import { RegisterByEmailCommand } from '../impl/register-by-email.command'
import { RegisterByEmailCommandHandler } from './register-by-email.handler'

describe('RegisterByEmailCommandHandler', () => {
  let handler: RegisterByEmailCommandHandler
  let queryBus: jest.Mocked<QueryBus>
  let userRepository: jest.Mocked<UserRepository>

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterByEmailCommandHandler,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<RegisterByEmailCommandHandler>(RegisterByEmailCommandHandler)
    queryBus = module.get(QueryBus)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const dto = { email: 'new@example.com', password: 'Password123!' }
    const command = new RegisterByEmailCommand(dto)

    it('should create new user when email not exists', async () => {
      queryBus.execute.mockResolvedValue(null)
      userRepository.create.mockReturnValue(mockUser as UserEntity)
      userRepository.save.mockResolvedValue(mockUser as UserEntity)

      jest.spyOn(securityUtils, 'generateHash').mockResolvedValue('hashedPassword')

      const result = await handler.execute(command)

      expect(queryBus.execute).toHaveBeenCalled()
      expect(userRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: 'hashedPassword',
      })
      expect(userRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw ConflictException when email already exists', async () => {
      queryBus.execute.mockResolvedValue(mockUser)

      await expect(handler.execute(command)).rejects.toThrow(ConflictException)
      await expect(handler.execute(command)).rejects.toThrow('error.emailAlreadyExists')

      expect(userRepository.create).not.toHaveBeenCalled()
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should hash password before saving', async () => {
      queryBus.execute.mockResolvedValue(null)
      userRepository.create.mockReturnValue(mockUser as UserEntity)
      userRepository.save.mockResolvedValue(mockUser as UserEntity)

      const hashSpy = jest.spyOn(securityUtils, 'generateHash').mockResolvedValue('hashedPassword')

      await handler.execute(command)

      expect(hashSpy).toHaveBeenCalledWith(dto.password)
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword' })
      )
    })
  })
})
```

## Todo List

- [ ] Create register-by-email.handler.spec.ts
- [ ] Test: creates user when email not exists
- [ ] Test: throws ConflictException when email exists
- [ ] Test: hashes password before saving
- [ ] Run all tests to verify

## Success Criteria

- [ ] 1 new test file created
- [ ] All new tests pass
- [ ] All existing 84 tests still pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Mocking complexity | Medium | Low | Follow existing test patterns |
| Flaky tests | Low | Medium | Use deterministic mocks |

## Security Considerations

- Tests verify security-critical paths (auth, password handling)
- Conflict exception test ensures proper error handling

## Deferred Work

Strategy tests deferred to future task:
- `src/modules/auth/jwt.strategy.spec.ts`
- `src/modules/auth/local.strategy.spec.ts`

## Next Steps

After this phase:
1. Run `pnpm test` to verify all 85+ tests pass
2. Run `pnpm test:cov` to check coverage
3. Commit: `test(auth): add unit tests for register handler`
4. Create PR for full review
