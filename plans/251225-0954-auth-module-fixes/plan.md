---
title: "Auth Module Security & Quality Fixes"
description: "Fix 12 HIGH/MED issues in auth module: password validation, JWT null check, async hash, CQRS fixes, tests"
status: in-progress
priority: P1
effort: 5h
issue: null
branch: fix/auth-module-security-cleanup
tags: [security, auth, bugfix, tests]
created: 2025-12-25
---

# Auth Module Security & Quality Fixes

## Overview

Comprehensive fix for auth module issues identified in code review. Addresses 6 HIGH, 4 MED, 2 LOW severity issues across security, performance, code quality, and test coverage.

**Source**: `plans/reports/code-reviewer-251225-0947-auth-module.md`
**Brainstorm**: `plans/reports/brainstorm-251225-0954-auth-module-fixes.md`

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Security Fixes | Done (2025-12-25) | 1h | [phase-01](./phase-01-security-fixes.md) |
| 2 | Async Hash Migration | Pending | 1h | [phase-02](./phase-02-async-hash-migration.md) |
| 3 | CQRS/Type Fixes | Pending | 1h | [phase-03](./phase-03-cqrs-type-fixes.md) |
| 4 | API/Cleanup | Pending | 1h | [phase-04](./phase-04-api-cleanup.md) |
| 5 | Unit Tests | Pending | 45m | [phase-05](./phase-05-unit-tests.md) |

## Key Decisions

| Decision | Choice |
|----------|--------|
| Password complexity | Strict (upper+lower+number+special) |
| Login validation | Length only (DoS prevention) |
| Hash migration | Remove sync, rename async to `generateHash` |
| expiresIn rename | Yes → expiresAt (breaking) |
| Commit strategy | 5 separate logical commits |
| Test scope | Register handler only (Phase 5 reduced) |

## Breaking Changes

| Change | Impact | Migration |
|--------|--------|-----------|
| `expiresIn` → `expiresAt` | Frontend API calls | Update clients before deploy |
| Strict password | New registrations only | Existing users unaffected |
| Remove sync `generateHash` | Internal callers | Update to async pattern |

## Success Criteria

- [ ] All 84 existing tests pass
- [ ] 1 new test file added (register handler)
- [ ] No implicit `any` in auth module
- [ ] Password validation rejects weak passwords
- [ ] JWT with deleted user returns 401
- [ ] `generateHash` is async (sync removed)

## Dependencies

- Check `@nestjs-architects/typed-cqrs` has `Command` export
- May need duration parsing utility for expiry calculation

---

## Validation Summary

**Validated**: 2025-12-25
**Questions asked**: 6

### Confirmed Decisions

| Decision | User Choice |
|----------|-------------|
| Password complexity | Keep strict regex |
| Sync hash deprecation | Remove sync now (not just deprecate) |
| API rename | Proceed with expiresIn → expiresAt |
| Async function naming | Use `generateHash` (not `generateHashAsync`) |
| Implementation scope | All 5 phases |
| Test scope | Register handler only (reduced from 3 files) |

### Action Items

- [x] Update Phase 2: Remove sync `generateHash` entirely, name async version `generateHash`
- [x] Update Phase 5: Reduce scope to register handler test only (skip strategy tests)
