# Phase 3: npm Scripts & Environment Setup

## Objective
Add npm scripts for seeding and update environment configuration.

## Tasks

### 3.1 Update package.json
**File**: `package.json`

Add to `scripts` section:
```json
{
  "scripts": {
    "seed:run": "ts-node -r tsconfig-paths/register src/databases/seeds/seed-runner.ts",
    "seed:admin": "ts-node -r tsconfig-paths/register src/databases/seeds/seed-runner.ts --only=admin",
    "test:e2e:seeded": "pnpm seed:run && pnpm test:e2e"
  }
}
```

**Script purposes**:
- `seed:run` - Run all registered seeders
- `seed:admin` - Run only admin seeder
- `test:e2e:seeded` - Seed then run E2E tests (full pipeline)

---

### 3.2 Update .env.example
**File**: `.env.example`

Add to testing section:
```env
# For testing
API_URL=http://localhost:3333
USER_EMAIL=user@test.com
USER_PASSWORD=Abcd12345!
ADMIN_EMAIL=admin@test.local
ADMIN_PASSWORD=Admin123!
```

---

### 3.3 Update .env (local development)

Ensure local `.env` has admin credentials:
```env
ADMIN_EMAIL=admin@test.local
ADMIN_PASSWORD=Admin123!
```

---

## CI/CD Considerations

For GitHub Actions or similar:
```yaml
# .github/workflows/test.yml
jobs:
  e2e:
    steps:
      - name: Run migrations
        run: pnpm migration:run
        env:
          NODE_ENV: test
          # ... DB env vars

      - name: Seed database
        run: pnpm seed:run
        env:
          NODE_ENV: test
          ADMIN_EMAIL: admin@test.local
          ADMIN_PASSWORD: Admin123!
          # ... other DB env vars

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          ADMIN_EMAIL: admin@test.local
          ADMIN_PASSWORD: Admin123!
```

---

## Final Verification

```bash
# 1. Run admin seed
pnpm seed:admin
# Expected: Admin user created

# 2. Run full E2E with seeding
pnpm test:e2e:seeded
# Expected: Seeds run, then E2E tests execute

# 3. Verify admin can login
curl -X POST http://localhost:3333/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.local","password":"Admin123!"}'
# Expected: 200 with token
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `package.json` | Add 3 seed scripts |
| `.env.example` | Add `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| `.env` | Add admin credentials for local dev |
