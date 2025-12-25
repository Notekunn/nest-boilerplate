# Phase 2: Async Hash Migration

## Context

- **Priority**: P1 (High)
- **Status**: Pending
- **Effort**: 1h
- **Commit**: `perf(auth): migrate to async bcrypt hash generation`

## Overview

Replace synchronous `bcrypt.hashSync()` with async `bcrypt.hash()`. Sync hashing blocks event loop for ~100ms per hash with cost 10, causing latency spikes under load.

**Validation Decision**: Remove sync version entirely, name async version `generateHash`.

## Key Insights

- `generateHash` uses `bcrypt.hashSync` (blocks event loop)
- `validateHash` already uses `bcrypt.compare` (async, no change needed)
- Strategy: Replace sync with async, remove sync version

## Related Code Files

| Action | File |
|--------|------|
| Modify | `src/shared/security.utils.ts` |
| Modify | `src/shared/security.utils.spec.ts` |
| Modify | `src/modules/auth/cqrs/commands/handler/register-by-email.handler.ts` |

## Implementation Steps

### Step 1: Replace Sync Hash with Async

**File**: `src/shared/security.utils.ts`

```typescript
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
```

**Changes**:
- Remove sync `generateHash` entirely
- Rename async version to `generateHash` (not `generateHashAsync`)
- Returns `Promise<string>` instead of `string`

### Step 2: Update Tests

**File**: `src/shared/security.utils.spec.ts`

Update existing `generateHash` tests to be async:

```typescript
import { generateHash, validateHash } from './security.utils'

describe('generateHash', () => {
  it('should generate a valid bcrypt hash', async () => {
    const password = 'testPassword123!'
    const hash = await generateHash(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.startsWith('$2')).toBe(true) // bcrypt prefix
  })

  it('should generate different hashes for same password', async () => {
    const password = 'testPassword123!'
    const hash1 = await generateHash(password)
    const hash2 = await generateHash(password)

    expect(hash1).not.toBe(hash2)
  })

  it('should generate hash that validates correctly', async () => {
    const password = 'testPassword123!'
    const hash = await generateHash(password)
    const isValid = await validateHash(password, hash)

    expect(isValid).toBe(true)
  })

  it('should use custom salt rounds', async () => {
    const password = 'testPassword123!'
    const hash = await generateHash(password, 4) // lower cost for test speed

    expect(hash).toBeDefined()
    const isValid = await validateHash(password, hash)
    expect(isValid).toBe(true)
  })
})
```

### Step 3: Update Register Handler

**File**: `src/modules/auth/cqrs/commands/handler/register-by-email.handler.ts`

```typescript
import { GetUserByEmailQuery } from '@modules/users/cqrs/queries/impl/get-user-by-email.query'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { ConflictException } from '@nestjs/common'
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { generateHash } from '@shared/security.utils'
import { Transactional } from 'typeorm-transactional'

import { RegisterByEmailCommand } from '../impl/register-by-email.command'

@CommandHandler(RegisterByEmailCommand)
export class RegisterByEmailCommandHandler
  implements ICommandHandler<RegisterByEmailCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional()
  async execute(command: RegisterByEmailCommand) {
    const {
      dto: { email, password },
    } = command
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email))

    if (user) {
      throw new ConflictException('error.emailAlreadyExists')
    }

    const newUser = this.userRepository.create({
      email,
      password: await generateHash(password),
    })

    return await this.userRepository.save(newUser)
  }
}
```

**Changes**:
- Import stays as `generateHash` (same name)
- Add `await` before `generateHash(password)` (now async)
- Add `implements ICommandHandler<RegisterByEmailCommand>` (also fixes Phase 3 issue)

## Todo List

- [ ] Replace sync `generateHash` with async version in security.utils.ts
- [ ] Update security.utils.spec.ts tests to use async/await
- [ ] Add `await` to generateHash call in register-by-email.handler.ts
- [ ] Run tests to verify

## Success Criteria

- [ ] `generateHash` returns `Promise<string>`
- [ ] No sync hash function exists
- [ ] Generated hash validates correctly
- [ ] Register endpoint still works
- [ ] All tests pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing await | Low | High | TypeScript will warn on unhandled Promise |
| Test failures | Medium | Low | Update test assertions |

## Security Considerations

- Hash cost remains at 10 (bcrypt default, secure)
- No change to password validation logic
- Same bcrypt algorithm, just async

## Next Steps

After this phase:
1. Run `pnpm test` to verify
2. Commit: `perf(auth): migrate to async bcrypt hash generation`
3. Proceed to Phase 3
