# E2E Admin Seeder Framework - Implementation Plan

**Date**: 2025-12-26
**Branch**: feat/init-seed
**Status**: Phase 1 DONE (2025-12-26)

## Overview

Implement extensible seeder framework with admin user seeding for E2E testing. Standalone TypeORM script approach (no NestJS context).

## Architecture

```
src/databases/seeds/
├── base.seeder.ts             # Abstract seeder interface
├── seed-runner.ts             # Main CLI entry point
└── seeders/
    └── admin-user.seeder.ts   # Admin user seeder
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Standalone TypeORM script | Fast, minimal, KISS |
| Production guard | Block if `NODE_ENV=production` | Safety |
| Idempotency | Skip if exists (by email) | Prevent duplicates |
| Password hashing | Reuse `generateHash` from `@shared/security.utils` | DRY |
| DataSource | Reuse existing `src/ormconfig.ts` | DRY, no duplicate config |

## Phases

| Phase | File | Description | Status |
|-------|------|-------------|--------|
| 1 | [phase-01-seed-infrastructure.md](./phase-01-seed-infrastructure.md) | Core infrastructure (DataSource, BaseSeeder, runner) | ✅ DONE |
| 2 | [phase-02-admin-seeder.md](./phase-02-admin-seeder.md) | Admin user seeder implementation | Planned |
| 3 | [phase-03-npm-scripts-env.md](./phase-03-npm-scripts-env.md) | npm scripts + env vars + docs | Planned |

## Dependencies

- Existing: `bcryptjs`, `typeorm`, `pg`, `dotenv`
- No new packages required

## Success Criteria

- [x] `pnpm seed` executes all seeders
- [ ] `pnpm seed:admin` runs only admin seeder
- [ ] Admin user created with `Roles.Admin`
- [ ] Seeder skips if admin exists
- [x] Blocks in production environment
- [ ] E2E tests can login as admin

## Files to Create

1. `src/databases/seeds/base.seeder.ts`
2. `src/databases/seeds/seed-runner.ts`
3. `src/databases/seeds/seeders/admin-user.seeder.ts`

## Files to Modify

1. `package.json` - add seed scripts
2. `.env.example` - add `ADMIN_EMAIL`, `ADMIN_PASSWORD`

## Validation Summary

**Validated:** 2025-12-26
**Questions asked:** 4

### Confirmed Decisions
- **CI Security**: Keep hardcoded examples in .env.example (test creds not secrets)
- **Safety Guard**: NODE_ENV=production check is sufficient (no extra flags needed)
- **Idempotency**: Skip-only approach (don't upsert existing admin)
- **BaseSeeder**: Keep minimal (YAGNI - add utilities when needed)

### Action Items
- [x] No plan changes required - all recommended options confirmed
