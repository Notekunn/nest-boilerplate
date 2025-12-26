# Phase 1: Seed Infrastructure

## Objective
Create core seeding infrastructure: BaseSeeder interface and seed runner CLI (reusing existing DataSource).

## Tasks

### 1.1 Create Base Seeder Interface
**File**: `src/databases/seeds/base.seeder.ts`

```typescript
import { DataSource } from 'typeorm'

/**
 * Abstract base class for all seeders.
 * Provides consistent interface for seed operations.
 */
export abstract class BaseSeeder {
  /** Unique seeder name (used for --only flag) */
  abstract readonly name: string

  /** Human-readable description */
  abstract readonly description: string

  /**
   * Execute the seeding logic.
   * Implementations should be idempotent (skip if data exists).
   */
  abstract run(dataSource: DataSource): Promise<void>
}
```

**Design notes**:
- Abstract class over interface for potential shared utilities later
- `name` used for CLI filtering
- Seeder responsible for idempotency check

---

### 1.2 Create Seed Runner CLI
**File**: `src/databases/seeds/seed-runner.ts`

```typescript
import 'dotenv/config'
import dataSource from '../../ormconfig'
import { AdminUserSeeder } from './seeders/admin-user.seeder'
// Import future seeders here

/** All registered seeders */
const seeders = [
  new AdminUserSeeder(),
  // Add more seeders here
]

/**
 * Parse CLI arguments
 */
function parseArgs(): { only?: string } {
  const args = process.argv.slice(2)
  const onlyIndex = args.indexOf('--only')

  return {
    only: onlyIndex !== -1 ? args[onlyIndex + 1] : undefined,
  }
}

/**
 * Main seed runner
 */
async function runSeeds(): Promise<void> {
  // Production guard
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seeding is blocked in production environment')
    console.error('Set NODE_ENV to something other than "production" to run seeds')
    process.exit(1)
  }

  const { only } = parseArgs()

  console.log('=== Seed Runner ===')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)

  // Filter seeders if --only specified
  const toRun = only
    ? seeders.filter((s) => s.name === only)
    : seeders

  if (only && toRun.length === 0) {
    console.error(`ERROR: No seeder found with name "${only}"`)
    console.log('Available seeders:', seeders.map((s) => s.name).join(', '))
    process.exit(1)
  }

  console.log(`Seeders to run: ${toRun.map((s) => s.name).join(', ')}`)
  console.log('')

  try {
    // Initialize DataSource (reusing existing config)
    await dataSource.initialize()
    console.log('Database connected')
    console.log('')

    // Run seeders sequentially
    for (const seeder of toRun) {
      console.log(`[${seeder.name}] ${seeder.description}`)
      await seeder.run(dataSource)
      console.log(`[${seeder.name}] Done`)
      console.log('')
    }

    console.log('=== All seeds completed ===')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

// Execute
runSeeds()
```

**Key changes from original plan**:
- Imports existing `dataSource` from `../../ormconfig`
- No duplicate DataSource config (DRY)
- Same features: production guard, --only filter, sequential execution

---

## Verification

After implementation:
```bash
# Should fail (no admin seeder yet)
pnpm ts-node src/databases/seeds/seed-runner.ts

# Should show production guard
NODE_ENV=production pnpm ts-node src/databases/seeds/seed-runner.ts
```

## Notes

- Phase 2 will add the actual AdminUserSeeder
- Runner already imports AdminUserSeeder (will error until Phase 2)
- Reuses existing ormconfig.ts DataSource (no duplicate config)
