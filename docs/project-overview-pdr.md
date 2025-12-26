# Project Overview & PDR

## Project Overview
A production-ready NestJS boilerplate designed for scalability and security. Features include CQRS architecture, fine-grained RBAC with CASL, and automated CI/CD.

## Product Development Requirements (PDR)

### Security Phase 1: Authentication Hardening (Implemented 2025-12-25)

#### Requirements
1. **Password Complexity**
   - Minimum 8 characters, maximum 128 characters.
   - Must contain: 1 uppercase, 1 lowercase, 1 digit, 1 special character (`@$!%*?&`).
   - Standardized via `PASSWORD_VALIDATION` constant.

2. **JWT Session Integrity**
   - Ensure authenticated users still exist in the database.
   - Invalidate tokens immediately if the user is deleted.

#### Implementation Scope
- `RegisterByEmailDto`: Enforce complexity on registration.
- `UpdateUserDto`: Enforce complexity on password changes.
- `LoginByEmailDto`: Enforce max length limit.
- `JwtStrategy`: Add DB check in validation loop.
- `PASSWORD_VALIDATION`: Centralized regex and messages.

#### Success Metrics
- 100% pass rate for auth/user E2E tests.
- Zero "zombie" sessions for deleted users.
