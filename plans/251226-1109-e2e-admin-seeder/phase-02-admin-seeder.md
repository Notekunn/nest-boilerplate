# Phase 2: Admin User Seeder

## Objective
Implement the admin user seeder with idempotent logic.

## Tasks

### 2.1 Create Admin User Seeder
**File**: `src/databases/seeds/seeders/admin-user.seeder.ts`

```typescript
import { Roles } from '@common/enum/role.enum'
import { UserEntity } from '@modules/users/entities/user.entity'
import { generateHash } from '@shared/security.utils'
import { DataSource } from 'typeorm'

import { BaseSeeder } from '../base.seeder'

/**
 * Seeds admin user for E2E testing.
 * Reads credentials from ADMIN_EMAIL and ADMIN_PASSWORD env vars.
 * Idempotent: skips if admin already exists.
 */
export class AdminUserSeeder extends BaseSeeder {
  readonly name = 'admin'
  readonly description = 'Create admin user for E2E testing'

  async run(dataSource: DataSource): Promise<void> {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    // Validate env vars
    if (!email || !password) {
      console.log('  SKIP: ADMIN_EMAIL or ADMIN_PASSWORD not set')
      return
    }

    const userRepo = dataSource.getRepository(UserEntity)

    // Idempotency check
    const existing = await userRepo.findOne({ where: { email } })
    if (existing) {
      console.log(`  SKIP: Admin user already exists (${email})`)
      return
    }

    // Create admin user
    const hashedPassword = await generateHash(password)
    const admin = userRepo.create({
      email,
      password: hashedPassword,
      name: 'Admin',
      role: Roles.Admin,
    })

    await userRepo.save(admin)
    console.log(`  CREATED: Admin user (${email}) with role=${Roles.Admin}`)
  }
}
```

**Key points**:
- Validates `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars
- Checks existing user by email (idempotent)
- Uses shared `generateHash` for password hashing (DRY)
- Sets `role: Roles.Admin` explicitly
- Logs action taken (SKIP or CREATED)

---

## Import Path Resolution

The seeder uses path aliases (`@common/`, `@modules/`, `@shared/`). These work because:
1. `tsconfig.json` defines path mappings
2. `ts-node` with `tsconfig-paths` resolves them at runtime

Ensure the seed script is run with proper tsconfig context:
```bash
pnpm ts-node -r tsconfig-paths/register src/databases/seeds/seed-runner.ts
```

---

## Verification

```bash
# Set test env vars
export ADMIN_EMAIL=admin@test.local
export ADMIN_PASSWORD=Admin123!

# Run seeder
pnpm ts-node -r tsconfig-paths/register src/databases/seeds/seed-runner.ts --only=admin

# Expected output:
# === Seed Runner ===
# Environment: development
# Database: localhost:5433/admin
# Seeders to run: admin
#
# [admin] Create admin user for E2E testing
#   CREATED: Admin user (admin@test.local) with role=admin
# [admin] Done
#
# === All seeds completed ===

# Run again (should skip)
pnpm ts-node -r tsconfig-paths/register src/databases/seeds/seed-runner.ts --only=admin
# Expected: SKIP: Admin user already exists
```

---

## E2E Test Usage

In E2E tests, login as admin:
```typescript
const { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } = process.env

const loginRes = await request(API_URL)
  .post('/v1/auth/login')
  .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })

const adminToken = loginRes.body.token.token
```
