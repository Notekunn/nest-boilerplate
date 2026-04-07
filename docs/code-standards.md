# Code Standards

## Project Structure

```
src/
├── modules/              # Feature modules (auth, users, ...)
├── common/               # Shared: DTOs, entities, enums, constants
├── configurations/       # Config loaders (app, jwt, typeorm)
├── decorators/           # Custom decorators & Swagger helpers
├── guards/               # Auth guards (JWT, Local, Access)
├── databases/            # Migrations, ORM config, seeders
├── shared/               # Utility functions & helpers
└── main.ts               # Bootstrap entrypoint
```

**Module structure (per feature):**
```
modules/{feature}/
├── controllers/          # HTTP endpoints
├── cqrs/
│   ├── commands/         # State-changing operations
│   │   ├── impl/         # Command classes
│   │   └── handlers/     # Command execution logic
│   └── queries/          # Read-only operations
│       ├── impl/         # Query classes
│       └── handlers/     # Query execution logic
├── dto/                  # Request/response contracts
├── entities/             # TypeORM entities
├── repositories/         # Custom data access
├── casl/                 # Permission definitions (if auth-required)
└── {feature}.module.ts   # Module definition & imports
```

**File naming conventions:**
- Files: `kebab-case.ts` (e.g., `user-repository.ts`, `update-user.command.ts`)
- Classes/Interfaces: `PascalCase` (e.g., `UserRepository`, `UpdateUserCommand`)
- Functions: `camelCase` (e.g., `getUserById()`)
- Constants: `UPPER_CASE` (e.g., `PASSWORD_VALIDATION`)

---

## Entity Standards

### Base Entity Classes

All entities must extend a base entity for consistency:

```typescript
// For most entities: use MetaEntity (adds id, createdAt, updatedAt)
import { MetaEntity } from '@common/entities/meta.entity'

@Entity('users')
export class UserEntity extends MetaEntity {
  @Column({ unique: true })
  email: string

  @Column()
  password: string // Always store hashed, never plaintext

  @Column('enum', { enum: Roles })
  role: Roles = Roles.User
}
```

**MetaEntity provides:**
- `id` (auto-increment primary key)
- `createdAt` (auto-set on insert)
- `updatedAt` (auto-set on insert/update)

**Column naming:**
- Database: `snake_case` (automatic via SnakeNamingStrategy)
- TypeScript: `camelCase`

### Entity Serialization

Exclude sensitive fields from API responses:

```typescript
import { Exclude } from 'class-transformer'

@Entity('users')
export class UserEntity extends MetaEntity {
  email: string

  @Exclude() // Never expose in API responses
  password: string
}
```

---

## DTO Standards

### Request DTOs (Input Validation)

Use `class-validator` decorators for fail-fast validation:

```typescript
import { IsEmail, MinLength, MaxLength, Matches } from 'class-validator'
import { PASSWORD_VALIDATION } from '@common/constants/password-validation.constant'

export class RegisterByEmailDto {
  @IsEmail()
  email: string

  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH)
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH)
  @Matches(PASSWORD_VALIDATION.REGEX, {
    message: PASSWORD_VALIDATION.MESSAGE,
  })
  password: string

  @MinLength(1)
  @MaxLength(255)
  name: string
}
```

### Response DTOs (Output Shaping)

Shape entities for API responses; exclude sensitive data:

```typescript
import { Exclude } from 'class-transformer'

export class UserResponseDto {
  id: number
  email: string
  name: string
  role: string
  createdAt: Date

  @Exclude()
  password: string // Excluded via ClassSerializerInterceptor
}
```

### Swagger Integration

Document all DTOs in Swagger with constraints matching validation:

```typescript
import { ApiProperty } from '@nestjs/swagger'

export class LoginByEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (8-128 chars, uppercase, lowercase, digit, special)',
    minLength: 8,
    maxLength: 128,
  })
  @Matches(PASSWORD_VALIDATION.REGEX)
  password: string
}
```

---

## CQRS Pattern

### Commands (State-Changing Operations)

**Convention:** `{Action}{Entity}.command.ts`

```typescript
// impl/update-user.command.ts
export class UpdateUserCommand {
  constructor(
    public readonly userId: number,
    public readonly payload: UpdateUserDto,
  ) {}
}

// handlers/update-user.handler.ts
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.userRepository.findOne(command.userId)
    if (!user) throw new NotFoundException()
    
    Object.assign(user, command.payload)
    return this.userRepository.save(user)
  }
}
```

### Queries (Read-Only Operations)

**Convention:** `{Resource}By{Criterion}.query.ts`

```typescript
// impl/get-user-by-id.query.ts
export class GetUserByIdQuery {
  constructor(public readonly userId: number) {}
}

// handlers/get-user-by-id.handler.ts
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery) {
    return this.userRepository.findOne(query.userId)
  }
}
```

### Handler Registration

Register all handlers in module `providers`:

```typescript
@Module({
  imports: [CqrsModule],
  providers: [
    // Handlers
    UpdateUserHandler,
    GetUserByIdHandler,
    // Commands
    UpdateUserCommand,
    // Queries
    GetUserByIdQuery,
  ],
})
export class UserModule {}
```

---

## Authentication & Authorization

### Guards Chain

1. **JwtAuthGuard**: Validate bearer token, extract user
2. **AccessGuard** (optional): Check CASL permissions

```typescript
@Controller('user')
@UseGuards(JwtAuthGuard, AccessGuard)
export class UserController {
  @Get('profile')
  @CheckPolicies((ability) => ability.can(Action.Read, UserEntity))
  async getProfile(@AuthUser() user: UserEntity) {
    return user
  }
}
```

### CASL Permissions

Define permissions in dedicated file per resource:

```typescript
// users/casl/user.permission.ts
import { InferSubjects, MongoAbility } from '@casl/ability'
import { Roles } from '@common/enum/role.enum'

export type Subjects = InferSubjects<typeof UserEntity> | 'all'

export type AppAbility = MongoAbility<[Action, Subjects]>

@Injectable()
export class UserPermission {
  createForUser(user: UserEntity): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

    if (user.role === Roles.Admin) {
      can(Action.Manage, 'all')
    } else {
      can(Action.Read, UserEntity, { id: user.id })
      can(Action.Update, UserEntity, { id: user.id })
    }

    return build()
  }
}
```

### CASL Hooks (Dynamic Context)

Use hooks for context-aware permission rules:

```typescript
// users/casl/user.hook.ts
@Injectable()
export class UserHook implements PoliciesHandler<CheckPolicies<UserEntity>> {
  constructor(private readonly userPermission: UserPermission) {}

  handle(ability: AppAbility, payload: CheckPolicies<UserEntity>) {
    const { user } = payload

    // For admin update: allow any user
    // For user update: allow only self
    if (payload.action === Action.Update && payload.subject === UserEntity) {
      if (user.role === Roles.Admin) return true
      return payload.object?.id === user.id
    }

    return ability.can(payload.action, payload.subject)
  }
}
```

---

## Password Security

### Centralized Validation

All password fields must reference `PASSWORD_VALIDATION` constant:

```typescript
// common/constants/password-validation.constant.ts
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[^\s]{8,}$/,
  MESSAGE:
    'Password must be 8-128 characters and contain uppercase, lowercase, digit, and special character (@$!%*?&)',
}
```

Usage in DTOs:

```typescript
export class UpdateUserDto {
  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH)
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH)
  @Matches(PASSWORD_VALIDATION.REGEX, {
    message: PASSWORD_VALIDATION.MESSAGE,
  })
  password?: string
}
```

### Password Hashing

Use `SecurityUtils` from `shared/security.utils.ts`:

```typescript
import { SecurityUtils } from '@shared/security.utils'

// In command handler or service
const hashedPassword = await SecurityUtils.hashPassword(plainPassword)

// When validating login
const isPasswordValid = await SecurityUtils.validatePassword(
  plainPassword,
  hashedPassword,
)
```

---

## Testing Standards

### Unit Tests

Test in isolation with mocked dependencies:

```typescript
describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler
  let userRepository: jest.Mocked<UserRepository>

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any

    handler = new UpdateUserHandler(userRepository)
  })

  it('should update user email', async () => {
    const user = { id: 1, email: 'old@test.com' }
    userRepository.findOne.mockResolvedValue(user)
    userRepository.save.mockResolvedValue({ ...user, email: 'new@test.com' })

    const result = await handler.execute(
      new UpdateUserCommand(1, { email: 'new@test.com' }),
    )

    expect(result.email).toBe('new@test.com')
  })
})
```

### E2E Tests (REQUIRED for every new API)

**Rule:** Every new API endpoint MUST have a corresponding e2e test file before merging. No exceptions.

**Location:** `test/{module-name}/{module-name}.e2e-spec.ts`

**Setup:** Tests run against a live server via `TEST_API_URL` env var using `supertest`.

```typescript
import request from 'supertest'

describe('{ModuleName} (e2e)', () => {
  const { TEST_API_URL, TEST_USER_PASSWORD } = process.env
  let userToken: string

  beforeAll(async () => {
    // Register and login to get auth token (if endpoints require auth)
    const res = await request(TEST_API_URL).post('/v1/auth/register').send({
      email: `test-${Date.now()}@example.com`,
      password: TEST_USER_PASSWORD,
    })
    userToken = res.body.token.token
  })

  describe('/v1/{resource} (POST)', () => {
    it('should create resource successfully', () => {
      return request(TEST_API_URL)
        .post('/v1/{resource}')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ /* valid payload */ })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should return 401 without auth token', () => {
      return request(TEST_API_URL)
        .post('/v1/{resource}')
        .send({ /* valid payload */ })
        .expect(401)
    })

    it('should return 400 for invalid payload', () => {
      return request(TEST_API_URL)
        .post('/v1/{resource}')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ /* invalid payload */ })
        .expect(400)
    })
  })
})
```

**Required test cases per endpoint:**

| Category | Test Cases |
|----------|-----------|
| **Happy path** | Valid request → expected status & response body |
| **Auth** | Missing token → 401, invalid token → 401 |
| **Validation** | Missing required fields → 400, invalid format → 400 |
| **Not found** | Non-existent resource → 404 |
| **Authorization** | Non-admin accessing admin endpoint → 403 |
| **Sensitive data** | Password never exposed in response |
| **Idempotency** | Duplicate creation → 409 (if applicable) |

**Checklist before merging new API:**
- [ ] E2e test file created at `test/{module}/`
- [ ] All CRUD endpoints covered
- [ ] Auth guard tests (401 for unauthenticated)
- [ ] Validation tests (400 for bad input)
- [ ] No sensitive fields in responses
- [ ] Tests pass: `pnpm test:e2e`

### Coverage Goals

- **Target:** >80% across all modules
- **Focus:** Business logic, guards, CASL rules
- **Exclude:** Migration files, main.ts, module definitions, Swagger setup

---

## Database & Seeding

### Migrations

Generate migrations from entity changes:

```bash
# Generate from code changes
pnpm migration:generate CreateUserTable

# Create empty migration for manual edits
pnpm migration:create AddRoleColumn

# Run all pending migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

**Naming convention:** `{Timestamp}-{Description}.ts`

### Seeders

Extend `BaseSeeder` for all new seeders:

```typescript
import { BaseSeeder } from '@databases/seeds/base.seeder'
import { DataSource } from 'typeorm'

export class AdminUserSeeder extends BaseSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(UserEntity)

    // Idempotent: check before insert
    const existing = await userRepository.findOne({ where: { email: 'admin@test.com' } })
    if (existing) return

    const admin = userRepository.create({
      email: 'admin@test.com',
      password: await SecurityUtils.hashPassword('Admin123!'),
      name: 'Admin User',
      role: Roles.Admin,
    })

    await userRepository.save(admin)
  }
}
```

**Safety rules:**
- Seeders blocked in production (set `NODE_ENV !== 'production'`)
- Must be idempotent or skip existing data
- Always hash passwords before storage

### Seeding CLI

```bash
# Run all seeders
pnpm seed:run

# Run specific seeder
pnpm seed:run --only admin-user

# CLI blocks in production automatically
```

---

## Configuration Management

All settings via environment variables (ConfigModule):

```typescript
// configurations/app.config.ts
import { registerAs } from '@nestjs/config'

export interface AppConfiguration {
  host: string
  port: number
  corsOrigins: string[]
}

export const appConfiguration = registerAs('app', (): AppConfiguration => ({
  host: process.env.SERVICE_HOST || '0.0.0.0',
  port: parseInt(process.env.SERVICE_PORT || '3000', 10),
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .filter((o) => o.trim()),
}))
```

Inject in controllers/services:

```typescript
constructor(private readonly configService: ConfigService) {
  const appConfig = configService.get<AppConfiguration>('app')
}
```

---

## Error Handling

Use NestJS built-in HTTP exceptions:

```typescript
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common'

// In handler/service
if (!user) {
  throw new NotFoundException('User not found')
}

if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid credentials')
}

if (!email) {
  throw new BadRequestException('Email is required')
}
```

Exception responses auto-formatted to JSON with status code.
