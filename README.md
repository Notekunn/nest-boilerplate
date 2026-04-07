## Nest Boilerplate

Production-ready NestJS 11 boilerplate with Fastify, TypeORM, PostgreSQL, CQRS, CASL auth, Swagger, Docker, and CI/CD -- clone and ship in minutes.

### Tech Stack

| Layer            | Stack                                                  |
| ---------------- | ------------------------------------------------------ |
| **Runtime**      | NestJS 11 (Fastify), TypeScript 5, Node.js 22+         |
| **Database**     | PostgreSQL + TypeORM (migrations, seeds)               |
| **Auth**         | JWT + Passport, CASL role-based authorization          |
| **Architecture** | CQRS, custom repositories, global validation           |
| **API Docs**     | Swagger / OpenAPI 3.0 (auto-generated)                 |
| **Quality**      | ESLint, Prettier, Jest (unit + e2e), Husky, CommitLint |
| **CI/CD**        | GitHub Actions, Semantic Release, Docker multi-stage   |

### Prerequisites

- Node.js >= 22.14
- pnpm
- PostgreSQL (local or managed)
- Docker (optional)

### Getting Started

```bash
# Install dependencies
pnpm install

# Create and fill your .env file (see Environment Variables below)
cp .env.example .env  # if available, or create .env manually
```

### Environment Variables

Configure these in `.env` (values shown are typical defaults):

| Variable                 | Description                             | Example                 |
| ------------------------ | --------------------------------------- | ----------------------- |
| `SERVICE_HOST`           | App host                                | `0.0.0.0`               |
| `SERVICE_PORT`           | App port                                | `3000`                  |
| `SERVICE_VERSION`        | App version                             | `1.0.0`                 |
| `CORS_ORIGINS`           | Comma-separated list of allowed origins | `http://localhost:3000` |
| `JWT_SECRET_KEY`         | JWT signing secret (required)           | `super-secret`          |
| `JWT_EXPIRATION_TIME`    | JWT expiration                          | `7d`                    |
| `DB_HOST`                | DB host (required)                      | `localhost`             |
| `DB_PORT`                | DB port (required)                      | `5432`                  |
| `DB_USERNAME`            | DB user (required)                      | `postgres`              |
| `DB_PASSWORD`            | DB password (required)                  | `postgres`              |
| `DB_NAME`                | DB name (required)                      | `nest_boilerplate`      |
| `DB_AUTO_RUN_MIGRATIONS` | Run migrations on boot                  | `false`                 |
| `DB_AUTO_SYNC`           | TypeORM sync (avoid in prod)            | `false`                 |
| `DB_LOGGING`             | Enable query logging                    | `false`                 |
| `DB_SSL`                 | Enable SSL connection                   | `false`                 |

### Run

```bash
# development
pnpm start

# watch mode
pnpm start:dev

# production (after build)
pnpm build && pnpm start:prod

# debug
pnpm start:debug
```

### API Documentation

Swagger UI is available at `http://localhost:3000/docs` by default.

### Testing

```bash
# unit tests
pnpm test

# e2e tests
pnpm test:e2e

# coverage
pnpm test:cov

# watch
pnpm test:watch
```

### Database (Migrations)

```bash
# generate a migration
pnpm migration:generate MigrationName

# run migrations
pnpm migration:run

# revert last migration
pnpm migration:revert

# create an empty migration
pnpm migration:create MigrationName
```

Notes:

- Migrations are generated into `src/databases/migrations`.
- CLI is configured via `src/ormconfig.ts`.

### Project Structure

```
src/
├── configurations/     # Config providers
├── databases/          # Migrations
├── modules/            # Feature modules (auth, users, ...)
├── common/             # DTOs, entities, enums
├── decorators/         # Custom decorators
├── guards/             # Auth guards
├── shared/             # Utilities
├── swagger.ts          # Swagger setup
└── main.ts             # App entrypoint
```

### Docker

```bash
# build image
docker build -t nest-boilerplate .

# run container
docker run -p 3000:3000 nest-boilerplate

# or using docker-compose
docker compose up -d
```

### CI/CD & Releases

- GitHub Actions ready
- Conventional Commits enforced via CommitLint + Husky
- Automated versioning and changelog with Semantic Release

### Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with conventional messages: `feat: add X`
3. Push and open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
