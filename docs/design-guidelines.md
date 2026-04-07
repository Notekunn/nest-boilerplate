# Design Guidelines

This document establishes design patterns, conventions, and best practices for developing features in nest-boilerplate.

---

## API Design Principles

### RESTful Conventions

**Endpoint Structure:**
```
/{version}/{resource}/{id}/{sub-resource}/{sub-id}
/v1/users/123/posts/456
```

**HTTP Methods:**
- `GET` — Retrieve data (read-only, idempotent)
- `POST` — Create new resource or trigger action
- `PUT` — Full resource replacement (idempotent)
- `PATCH` — Partial resource update
- `DELETE` — Remove resource (idempotent)

**Status Codes:**
- `200 OK` — Successful GET/PUT/PATCH
- `201 Created` — Successful POST creating resource
- `204 No Content` — Successful DELETE or no response body
- `400 Bad Request` — Invalid input (validation failed)
- `401 Unauthorized` — Missing/invalid authentication
- `403 Forbidden` — Authenticated but insufficient permissions
- `404 Not Found` — Resource not found
- `409 Conflict` — Duplicate resource (e.g., email exists)
- `422 Unprocessable Entity` — Semantic validation failed
- `429 Too Many Requests` — Rate limit exceeded
- `500 Internal Server Error` — Unexpected server error
- `503 Service Unavailable` — Server down/maintenance

**Response Format:**

All responses return JSON with consistent structure:

```json
{
  "data": { /* resource or array of resources */ },
  "statusCode": 200,
  "message": "Success",
  "timestamp": "2026-04-07T10:00:00Z"
}
```

Or for errors:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2026-04-07T10:00:00Z"
}
```

### Pagination

For endpoints returning multiple items:

```
GET /v1/users?page=1&limit=20&sort=createdAt:desc

Response:
{
  "data": [ { id: 1, ... }, ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Parameters:**
- `page` (optional, default: 1) — Page number (1-indexed)
- `limit` (optional, default: 20) — Items per page (max: 100)
- `sort` (optional) — Field:direction (e.g., `createdAt:desc`, `email:asc`)
- `filter` (optional) — Field:operator:value (e.g., `role:eq:admin`)

### Versioning

- **URI Versioning:** `/v1/`, `/v2/`, etc.
- **Deprecation:** Announce 6+ months before removing old version
- **Backcompat:** v1 stays supported for 2 years after v2 release

---

## DTO & Validation Patterns

### Request DTO Structure

```typescript
// login-by-email.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, Matches } from 'class-validator'
import { PASSWORD_VALIDATION } from '@common/constants/password-validation.constant'

export class LoginByEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password (8-128 chars)',
    minLength: PASSWORD_VALIDATION.MIN_LENGTH,
    maxLength: PASSWORD_VALIDATION.MAX_LENGTH,
  })
  @Matches(PASSWORD_VALIDATION.REGEX, {
    message: PASSWORD_VALIDATION.MESSAGE,
  })
  password: string
}
```

**Best Practices:**
- Use `@ApiProperty()` to document in Swagger
- Use validation decorators from `class-validator`
- Include `example` for clarity
- Reference centralized constants (`PASSWORD_VALIDATION`)
- Fail-fast: ValidationPipe rejects before handler executes

### Response DTO Structure

```typescript
// user-response.dto.ts
import { Exclude } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'user@example.com' })
  email: string

  @ApiProperty({ example: 'John Doe' })
  name: string

  @ApiProperty({ example: 'User', enum: ['User', 'Admin'] })
  role: string

  @ApiProperty({ example: '2026-04-07T10:00:00Z' })
  createdAt: Date

  @Exclude() // Never expose password in API
  password?: string
}
```

**Best Practices:**
- Use `@Exclude()` on sensitive fields
- Include `@ApiProperty()` with examples
- Match Swagger docs to actual fields returned
- Use `enum` in Swagger for constrained values
- ClassSerializerInterceptor auto-applies @Exclude()

### Composite DTOs

For complex requests/responses:

```typescript
export class CreateOrderDto {
  @ValidateNested()
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto
}
```

---

## CQRS Command & Query Design

### Command Definition

Immutable class representing an action:

```typescript
// create-token.command.ts
export class CreateTokenCommand {
  constructor(public readonly userId: number) {}
}
```

**Rules:**
- Constructor parameters only (no setters)
- Single responsibility (one action per command)
- Minimal data (only what's needed for handler)
- Naming: `{Verb}{Noun}Command` (e.g., `CreateUserCommand`)

### Command Handler

Executes command, updates state, returns result:

```typescript
// create-token.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: CreateTokenCommand): Promise<string> {
    const payload = { id: command.userId }
    return this.jwtService.sign(payload)
  }
}
```

**Rules:**
- One handler per command (strict 1:1)
- Implement `ICommandHandler<T>`
- Use `@CommandHandler(CommandClass)` decorator
- Return result (not side effects)
- Throw exceptions on validation/business logic failures
- Use `@Transactional()` for multi-step operations

### Query Definition

Immutable class representing a read:

```typescript
// get-user-by-id.query.ts
export class GetUserByIdQuery {
  constructor(public readonly userId: number) {}
}
```

**Rules:**
- No side effects
- Single responsibility
- Naming: `Get{Noun}By{Criterion}Query` (e.g., `GetUserByEmailQuery`)

### Query Handler

Executes query, returns data, no mutations:

```typescript
// get-user-by-id.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserEntity | null> {
    return this.userRepository.findOne(query.userId)
  }
}
```

**Rules:**
- Implement `IQueryHandler<T>`
- Use `@QueryHandler(QueryClass)` decorator
- Never mutate state (read-only)
- Return data (not command results)
- Throw exceptions only for validation errors (not "not found")

### Command/Query Dispatching in Controllers

```typescript
import { CommandBus, QueryBus } from '@nestjs/cqrs'

@Controller('user')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('profile')
  async getProfile(@AuthUser() user: UserEntity) {
    // Query: fetch data
    return this.queryBus.execute(new GetUserByIdQuery(user.id))
  }

  @Post('profile')
  async updateProfile(
    @AuthUser() user: UserEntity,
    @Body() updateDto: UpdateUserDto,
  ) {
    // Command: modify state
    return this.commandBus.execute(new UpdateUserCommand(user.id, updateDto))
  }
}
```

---

## Authorization (CASL) Patterns

### Permission Definition

Define permissions per resource:

```typescript
// user.permission.ts
import { InferSubjects } from '@casl/ability'
import { Roles } from '@common/enum/role.enum'

export type Subjects = InferSubjects<typeof UserEntity> | 'all'

@Injectable()
export class UserPermission {
  createForUser(user: UserEntity): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

    if (user.role === Roles.Admin) {
      // Admin can do anything
      can(Action.Manage, 'all')
    } else {
      // User can read own profile
      can(Action.Read, UserEntity, { id: user.id })
      // User can update own profile
      can(Action.Update, UserEntity, { id: user.id })
    }

    return build()
  }
}
```

**Rules:**
- One permission class per resource
- Use `createForUser()` to generate ability
- Admin role gets `Action.Manage` on all resources
- Use conditions for context-aware rules (e.g., `{ id: user.id }`)

### Access Guard with Policies

Protect endpoints with CASL:

```typescript
import { CheckPolicies, PoliciesGuard } from 'nest-casl'

@Controller('user')
@UseGuards(JwtAuthGuard, AccessGuard) // Order matters
export class UserController {
  @Get('profile')
  @CheckPolicies((ability) => ability.can(Action.Read, UserEntity))
  async getProfile(@AuthUser() user: UserEntity) {
    return user
  }

  @Put(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, UserEntity))
  async updateUser(
    @AuthUser() user: UserEntity,
    @Param('id') userId: number,
    @Body() updateDto: UpdateUserDto,
  ) {
    // User: Check CASL in handler or use hook
    return this.commandBus.execute(new UpdateUserCommand(userId, updateDto))
  }
}
```

**Guard Order:**
1. `JwtAuthGuard` — Authenticate (get user from token)
2. `AccessGuard` — Authorize (check CASL permissions)

### CASL Hook for Dynamic Rules

For complex authorization (e.g., allow admin OR owner):

```typescript
// user.hook.ts
@Injectable()
export class UserHook implements PoliciesHandler<CheckPolicies<UserEntity>> {
  constructor(private readonly userPermission: UserPermission) {}

  handle(ability: AppAbility, payload: CheckPolicies<UserEntity>) {
    const { user, action, subject, object } = payload

    // Custom logic: allow admin or owner
    if (action === Action.Update && subject === UserEntity) {
      if (user.role === Roles.Admin) return true
      if (object?.id === user.id) return true
      return false
    }

    // Fall back to CASL ability
    return ability.can(action, subject)
  }
}
```

---

## Service & Repository Patterns

### Repository (Data Access Layer)

```typescript
// user.repository.ts
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    Object.setPrototypeOf(this, repository)
  }

  // Custom queries
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email } })
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    return this.find({ where: { deletedAt: IsNull() } })
  }
}
```

**Rules:**
- One repository per entity
- Extend TypeORM `Repository`
- Add custom query methods (avoid logic in handlers)
- Keep queries simple, readable
- Use QueryBuilder for complex queries

### Custom Query Builder

For complex filtering/joining:

```typescript
async findByRoleWithPostCount(role: Roles): Promise<any[]> {
  return this.createQueryBuilder('u')
    .leftJoinAndSelect('u.posts', 'p')
    .where('u.role = :role', { role })
    .select(['u.id', 'u.email', 'COUNT(p.id) as postCount'])
    .groupBy('u.id')
    .orderBy('postCount', 'DESC')
    .getRawMany()
}
```

---

## Entity & Database Patterns

### Entity Design

```typescript
// user.entity.ts
import { MetaEntity } from '@common/entities/meta.entity'

@Entity('users')
@Index('idx_email', ['email'], { unique: true })
export class UserEntity extends MetaEntity {
  @Column({ unique: true })
  email: string

  @Column()
  password: string // Always hashed, never plaintext

  @Column()
  name: string

  @Column('enum', { enum: Roles })
  role: Roles = Roles.User

  @Column({ nullable: true, type: 'timestamp' })
  @Exclude()
  deletedAt?: Date

  // Methods
  isDeleted(): boolean {
    return !!this.deletedAt
  }

  isAdmin(): boolean {
    return this.role === Roles.Admin
  }
}
```

**Rules:**
- Extend `MetaEntity` for auto id, createdAt, updatedAt
- Use `@Index()` for performance-critical queries
- Set `unique: true` for unique columns
- Use `enum` type for constrained values
- Add computed methods (e.g., `isAdmin()`)
- Use `@Exclude()` for sensitive fields (password)
- Use `nullable: true` for optional columns
- Never store plaintext passwords

### Database Migrations

Generated via `pnpm migration:generate MigrationName`:

```typescript
// migrations/1766720110464-AddUserTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class AddUserTable1766720110464 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            length: '255',
          },
          {
            name: 'password',
            type: 'text',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
```

**Rules:**
- Always provide `down()` for rollback
- Use snake_case for column names (SnakeNamingStrategy)
- Add indexes for performance
- Add constraints (unique, check, foreign key)
- Keep migrations small & focused

---

## Guard & Middleware Patterns

Guards execute before handlers, can deny access:

```typescript
// Typical: JwtAuthGuard + AccessGuard chain
@UseGuards(JwtAuthGuard, AccessGuard)
@Get('profile')
async getProfile(@AuthUser() user: UserEntity) {
  return user
}
```

**Guard order:**
1. `JwtAuthGuard` — Authenticate (extract user from token)
2. `AccessGuard` — CASL check (permissions)

---

## Decorator Patterns

### Custom Decorators

```typescript
// Extract authenticated user from request
@Get('profile')
async getProfile(@AuthUser() user: UserEntity) {
  return user  // Added by JwtAuthGuard
}
```

### Swagger Decorators

Document all endpoints:

```typescript
@Post('register')
@ApiOperation({ summary: 'Register new user' })
@ApiResponse({ status: 201, type: LoginResponseDto })
@ApiResponse({ status: 400, description: 'Validation failed' })
async register(@Body() dto: RegisterByEmailDto) { }
```

---

## Error Handling

Use NestJS built-in HTTP exceptions:

```typescript
throw new BadRequestException('Invalid input')
throw new UnauthorizedException('Invalid credentials')
throw new ForbiddenException('Insufficient permissions')
throw new NotFoundException('Resource not found')
throw new ConflictException('Email already exists')
```

Exceptions auto-formatted to JSON with proper status code.

---

## Testing Patterns

### Unit Test (Isolated)

```typescript
describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler
  let repository: jest.Mocked<UserRepository>

  beforeEach(() => {
    repository = { findOne: jest.fn(), save: jest.fn() } as any
    handler = new UpdateUserHandler(repository)
  })

  it('should update user', async () => {
    const user = { id: 1, email: 'old@test.com' }
    repository.findOne.mockResolvedValue(user)
    repository.save.mockResolvedValue({ ...user, email: 'new@test.com' })

    const result = await handler.execute(
      new UpdateUserCommand(1, { email: 'new@test.com' })
    )

    expect(result.email).toBe('new@test.com')
  })
})
```

### E2E Test (Full Flow)

```typescript
describe('Auth E2E', () => {
  it('should register and login', async () => {
    // Register
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ email: 'test@example.com', password: 'Pass123!', name: 'Test' })
      .expect(201)

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Pass123!' })
      .expect(200)

    expect(loginRes.body).toHaveProperty('accessToken')
  })
})
```

---

## Configuration

All config via `ConfigModule`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfiguration, jwtConfiguration, typeormConfiguration],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

Use in services:

```typescript
constructor(private configService: ConfigService) {
  const appConfig = configService.get<AppConfiguration>('app')
}
```

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `user-repository.ts` |
| Classes | PascalCase | `UserEntity`, `UpdateUserHandler` |
| Functions | camelCase | `getUserById()` |
| Constants | UPPER_CASE | `PASSWORD_VALIDATION` |
| Table/column names | snake_case | `created_at` |
| DTOs | {Name}Dto | `UpdateUserDto` |
| Commands | {Verb}{Noun}Command | `CreateUserCommand` |
| Queries | Get{Noun}By{Criterion}Query | `GetUserByIdQuery` |

---

## Key Anti-Patterns

| Avoid | Do Instead |
|-------|-----------|
| Business logic in controllers | Move to handlers/CQRS |
| Plaintext passwords in storage | Hash via SecurityUtils |
| Password in API responses | Use `@Exclude()` decorator |
| No input validation | Use class-validator in DTOs |
| Hardcoded configuration | Use ConfigService + .env |
| Skipping DB check in JWT strategy | Always validate user exists |
| No permission checks | Use AccessGuard + CASL |

