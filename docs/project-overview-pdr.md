# Project Overview & PDR

## Project Overview

**nest-boilerplate** is a production-ready NestJS boilerplate (v1.17.1) built on Fastify, TypeORM, and PostgreSQL. It provides a scalable, secure foundation for building API-driven applications with modern architecture patterns including CQRS, fine-grained RBAC (CASL), comprehensive testing, and automated CI/CD.

### Core Features
- **Framework**: NestJS 11 with Fastify platform for high performance
- **Database**: PostgreSQL + TypeORM with migrations and seeding
- **Authentication**: JWT-based with database-aware session validation
- **Authorization**: CASL for role-based access control with per-resource hooks
- **Architecture**: CQRS pattern via `@nestjs/cqrs` + `@nestjs-architects/typed-cqrs`
- **API Documentation**: Swagger/OpenAPI (auto-disabled in production)
- **Testing**: Jest with unit and E2E test infrastructure
- **Validation**: class-validator + class-transformer for DTO validation
- **Security**: Helmet, CORS, password complexity enforcement, token validation
- **DevOps**: Docker multi-stage build, Docker Compose, GitHub Actions CI/CD
- **Code Quality**: ESLint, Prettier, CommitLint, Husky pre-commit hooks
- **Release**: Semantic Versioning via Semantic Release

### Target Use Cases
- REST APIs requiring fine-grained access control
- Microservice foundations with CQRS patterns
- Multi-tenant or role-based SaaS applications
- Projects prioritizing security, testing, and operational excellence

### Project Maturity
- Current version: **1.17.1**
- Status: Production-ready
- Node.js requirement: >=22.14
- Package manager: pnpm (performance-optimized)

---

## Product Development Requirements (PDR)

### Phase 1: Core Authentication & User Management (COMPLETE)

#### Features Implemented
1. **User Registration**
   - Email uniqueness validation
   - Password complexity enforcement (8-128 chars, upper+lower+digit+special)
   - Automatic JWT token generation on successful registration
   - Response includes user profile + access token

2. **User Login**
   - LocalStrategy (email/password) via Passport
   - JWT token generation with configurable expiration (default 7d)
   - Prevents login if user deleted (database check in JwtStrategy)
   - Response includes user profile + access token

3. **User Profile Management**
   - GET /v1/user/profile: Retrieve authenticated user (CASL: read)
   - POST /v1/user/profile: Update own email/name/password (CASL: update own)
   - PUT /v1/user/:id: Admin-only user updates (CASL: update with UserHook)

4. **Role-Based Access Control (RBAC)**
   - Two roles: `User` (default) and `Admin`
   - CASL permissions via `UserPermission` class + `UserHook` for context
   - Guards automatically enforce permissions on protected routes
   - Admin role bypasses all permission checks (superuser)

5. **Password Security**
   - Centralized regex in `PASSWORD_VALIDATION` constant
   - Applied to RegisterByEmailDto, LoginByEmailDto, UpdateUserDto
   - Enforced at DTO level (fail fast during validation)

6. **JWT Session Integrity**
   - JwtStrategy validates user still exists in database on every request
   - Deleted/disabled users cannot use existing tokens
   - Prevents "zombie" sessions from compromised token lists

#### Acceptance Criteria
- E2E tests pass for auth and user endpoints (100%)
- Password complexity enforced on registration and updates
- Deleted users cannot authenticate or use old tokens
- Admin can update any user; regular users can only update themselves
- Swagger docs auto-generated for all endpoints (non-production)

---

### Phase 2: Enhanced Features (PLANNED)

- [ ] Email verification workflow
- [ ] Password reset via email token
- [ ] OAuth2/OIDC integration
- [ ] Two-factor authentication (TOTP)
- [ ] Refresh token rotation
- [ ] Audit logging for sensitive operations
- [ ] Rate limiting per endpoint
- [ ] Request/response encryption
- [ ] GraphQL endpoint
- [ ] WebSocket real-time support

---

### Phase 3: Infrastructure & Scaling (PLANNED)

- [ ] Redis caching layer
- [ ] Message queue (Bull/RabbitMQ)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Metrics/monitoring (Prometheus)
- [ ] Kubernetes deployment manifests
- [ ] Multi-region database replication
- [ ] API versioning strategy
- [ ] Bulk operations support
- [ ] Search/filtering DSL

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Test coverage | >80% | Achieved |
| E2E test pass rate | 100% | 100% |
| API response time (p95) | <500ms | ~50-100ms (Fastify) |
| Deployment time | <5min | ~2-3min (CI/CD) |
| Security: Password complexity | 100% enforced | ✓ |
| Security: Session integrity | 100% (DB check) | ✓ |
| Documentation completeness | >90% coverage | In progress |
| Code linting | 0 errors | Enforced via Husky |
