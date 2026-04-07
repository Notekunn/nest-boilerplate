# Codebase Summary

## Overview
Production-ready NestJS 11 boilerplate (v1.17.1) running on Fastify with PostgreSQL. Implements CQRS, CASL RBAC, comprehensive testing, and modern DevOps practices. Designed for rapid API development with security and scalability built-in.

## Directory Structure

```
src/
├── main.ts                      # Bootstrap: Fastify app init, Helmet, CORS, validation
├── app.module.ts                # Root module: Config, TypeORM, CASL setup
├── app.controller.ts            # Health check endpoint
├── configurations/              # Config loaders (app, jwt, typeorm)
├── modules/
│   ├── auth/                    # Authentication (login, register, JWT strategy)
│   │   ├── controllers/         # Auth endpoints
│   │   ├── cqrs/
│   │   │   ├── commands/        # CreateToken, RegisterByEmail, LoginByEmail
│   │   │   └── handlers/        # Command handlers with business logic
│   │   ├── dto/                 # LoginByEmailDto, RegisterByEmailDto, TokenResponseDto
│   │   ├── local.strategy.ts    # Passport LocalStrategy
│   │   ├── jwt.strategy.ts      # Passport JwtStrategy + DB user validation
│   │   └── auth.module.ts
│   └── users/                   # User management & authorization
│       ├── controllers/         # Profile & admin endpoints
│       ├── cqrs/
│       │   ├── commands/        # UpdateUserCommand
│       │   └── queries/         # GetUserById, GetUserByEmail
│       ├── casl/                # CASL permission definitions + UserHook
│       ├── entities/            # UserEntity (id, email, name, password, role)
│       ├── repositories/        # UserRepository (custom queries)
│       ├── dto/                 # UpdateUserDto, UserResponseDto
│       └── user.module.ts
├── common/
│   ├── constants/               # PASSWORD_VALIDATION regex + messages
│   ├── dto/                     # Base pagination/response DTOs
│   ├── entities/                # AbstractEntity, MetaEntity (id, created, updated)
│   ├── enum/                    # RoleEnum (User, Admin)
│   └── interfaces/              # AuthenticatedRequest
├── decorators/
│   ├── auth-user.decorator.ts   # @AuthUser() — inject authenticated user
│   ├── typeorm-ex.decorator.ts  # @Transactional() — database transactions
│   └── swagger/                 # API documentation decorators
├── guards/
│   ├── jwt-auth.guard.ts        # JwtAuthGuard — validates JWT
│   ├── local-auth.guard.ts      # LocalAuthGuard — email/password validation
│   └── access.guard.ts          # AccessGuard — CASL permission checking
├── databases/
│   ├── migrations/              # TypeORM migrations (snake_case naming)
│   └── seeds/
│       ├── base.seeder.ts       # Abstract seeder with DataSource access
│       ├── seed-runner.ts       # CLI runner for seeders
│       └── seeders/             # Specific seeders (e.g., admin-user.seeder.ts)
├── shared/                      # Utility functions + tests
│   ├── array.utils.ts           # Array helpers (chunk, flatten, etc.)
│   ├── string.utils.ts          # String helpers (camelToSnake, etc.)
│   ├── number.utils.ts          # Number helpers
│   └── security.utils.ts        # Password hashing (Argon2, bcrypt)
├── swagger.ts                   # Swagger setup (disabled in production)
├── ormconfig.ts                 # TypeORM CLI config (migrations)
└── snake-naming.strategy.ts     # TypeORM naming strategy (columns → snake_case)

test/                           # E2E tests (mirrors src/ structure)
├── auth.e2e-spec.ts
└── users.e2e-spec.ts
```

## Core Modules

### AuthModule
Handles user authentication (registration, login, JWT generation).

**Entry points:**
- `POST /v1/auth/register` — Create new user with email/password
- `POST /v1/auth/login` — Authenticate user, return JWT token

**Key flows:**
1. RegisterByEmail command → CreateToken command → User + JWT response
2. LoginByEmail (local strategy) → CreateToken command → User + JWT response

**Strategies:**
- `LocalStrategy`: Email + password validation via UserRepository
- `JwtStrategy`: Bearer token extraction, signature validation, database user check

**DTOs:**
- `LoginByEmailDto`: { email, password } with PASSWORD_VALIDATION rules
- `RegisterByEmailDto`: { email, password, name } with PASSWORD_VALIDATION rules
- `LoginResponseDto`: { user, accessToken }

### UserModule
Manages user profiles, role-based updates, and CASL authorization.

**Entry points:**
- `GET /v1/user/profile` — Get authenticated user's profile
- `POST /v1/user/profile` — Update own profile (email, name, password)
- `PUT /v1/user/:id` — Admin: Update any user

**CASL Permissions:**
- `read`: User can read own profile only
- `update`: User can update own profile; Admin can update any user (via UserHook)

**Key components:**
- `UserRepository`: Extended repository with `findByEmail()` custom query
- `GetUserByIdQuery` / `GetUserByEmailQuery`: Fetch user from DB
- `UpdateUserCommand`: Business logic for profile updates
- `UserPermission`: CASL rules definition
- `UserHook`: Dynamic permission context (e.g., allow admin or user updates own)

### CommonModule
Shared DTOs, entities, enums, constants.

**Key entities:**
- `UserEntity`: User aggregate with id, email, password (hashed), name, role, timestamps
- `MetaEntity`: Base entity with id, createdAt, updatedAt (automatic)
- `AbstractEntity`: Extension point for custom entities

**Enums:**
- `RoleEnum`: `User` (default), `Admin` (superuser)

**Constants:**
- `PASSWORD_VALIDATION`: Regex (8-128 chars, upper+lower+digit+special) + error messages

### DatabaseModule
Migrations, seeding, TypeORM configuration.

**Key files:**
- `typeorm.config.ts`: Environment-based connection config (snake_case strategy)
- `ormconfig.ts`: CLI config for `nest-cli migration:*` commands
- `migrations/`: Auto-generated via `nest-cli migration:generate`
- `BaseSeeder`: Abstract class for seeders with `run(dataSource: DataSource)` method
- `SeedRunner`: CLI utility to discover & execute seeders (production-safe)

## Bootstrap Flow

1. **main.ts**: Initialize transactional context, create Fastify app
2. **app.module.ts**: Load configs, setup TypeORM (transactional), initialize CASL
3. **ValidationPipe**: Whitelist, transform, forbid unknowns (fail-fast)
4. **Helmet**: CSP, X-Frame-Options, X-Content-Type-Options
5. **Morgan**: HTTP request logging (dev mode)
6. **Swagger**: Initialize docs at `/docs` (non-prod only)
7. **Listen**: Bind to configured host:port

## Key Patterns

### CQRS
- Commands: Actions with side effects (RegisterByEmail, LoginByEmail, UpdateUser)
- Queries: Read-only (GetUserById, GetUserByEmail)
- Handlers: Implement business logic, interact with repositories
- CommandBus / QueryBus: Dispatch & execute in the right handler

### Entity-Repository-DTO Pattern
- `Entity`: Database model (e.g., UserEntity)
- `Repository`: Data access layer with custom queries
- `DTO`: Request/response contracts with validation & transformation

### Middleware/Guards Chain
- `JwtAuthGuard`: Validates JWT, extracts user from token
- `AccessGuard`: CASL permission check per resource
- `LocalAuthGuard`: Email/password validation via UserRepository

### Transactional Data
- `@Transactional()` decorator: Wrap functions in DB transactions
- `typeorm-transactional`: Automatic rollback on error
- Used in command handlers for atomic operations

## Testing Strategy

**Unit Tests** (`.spec.ts` files):
- Test individual functions, guards, strategies in isolation
- Mock dependencies (repositories, ConfigService, QueryBus)
- Fast feedback loop

**E2E Tests** (`.e2e-spec.ts`):
- Real HTTP requests against bootstrapped app
- Real database (separate test DB)
- Verify full flows: register → login → access protected resource

**Coverage:**
- Target: >80% across all modules
- Exclude migration files, seeder CLI logic
- Focus on business logic, auth guards, CASL rules

## Configuration

All config via environment variables, loaded by `ConfigModule` (global):

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `NODE_ENV` | enum | development | Feature toggles (swagger, migrations, logging) |
| `SERVICE_HOST` | string | 0.0.0.0 | Fastify bind address |
| `SERVICE_PORT` | number | 3000 | Fastify bind port |
| `SERVICE_VERSION` | string | 1.0.0 | API version (cosmetic) |
| `CORS_ORIGINS` | string | *empty* | Comma-separated CORS origins (or * for all) |
| `JWT_SECRET_KEY` | string | *required* | Secret for signing JWT tokens |
| `JWT_EXPIRATION_TIME` | string | 7d | Token expiration (human-readable, e.g., "24h") |
| `DB_HOST` | string | *required* | PostgreSQL host |
| `DB_PORT` | number | 5432 | PostgreSQL port |
| `DB_USERNAME` | string | *required* | PostgreSQL user |
| `DB_PASSWORD` | string | *required* | PostgreSQL password |
| `DB_NAME` | string | *required* | PostgreSQL database name |
| `DB_AUTO_RUN_MIGRATIONS` | boolean | false | Auto-run migrations on boot |
| `DB_AUTO_SYNC` | boolean | false | TypeORM auto-sync (avoid production) |
| `DB_LOGGING` | boolean | false | Log SQL queries |
| `DB_SSL` | boolean | false | SSL connection for remote DBs |

## Security Highlights

1. **Password Hashing**: Argon2 via shared utils (prevent plaintext storage)
2. **JWT Validation**: Per-request DB check (prevent stale sessions)
3. **CORS**: Explicit origin whitelist (prevent CSRF)
4. **Helmet**: CSP, X-Frame, X-Content-Type, X-XSS (prevent injection)
5. **Input Validation**: Whitelist + forbid unknown props (prevent injection)
6. **CASL**: Fine-grained permissions per resource (prevent unauthorized access)
7. **Transactional**: Atomic operations prevent race conditions

## Development & DevOps

**Local development:**
- `pnpm start:dev` — Watch mode with hot reload
- PostgreSQL via Docker Compose: `docker compose up -d`
- Tests: `pnpm test` or `pnpm test:watch`

**CI/CD (GitHub Actions):**
- Lint & format checks on PR
- Unit & E2E tests on push
- Docker image build & publish
- Semantic Release for versioning + changelog

**Deployment:**
- Docker image: Multi-stage build (dependencies → prod only)
- docker-compose.yml for local orchestration
- Environment config via .env file or secret injection
