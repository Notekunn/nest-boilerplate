<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" height="80" alt="Nest Logo" /></a>
  <a href="https://typeorm.io/" target="blank"><img src="https://avatars.githubusercontent.com/u/20165699" height="80" alt="TypeORM Logo" /></a>
  <a href="https://www.postgresql.org/" target="blank"><img src="https://www.postgresql.org/media/img/about/press/elephant.png" height="80" alt="PostgreSQL Logo" /></a>
  <a href="https://jestjs.io/" target="blank"><img src="https://raw.githubusercontent.com/facebook/jest/main/website/static/img/jest.png" height="80" alt="Jest Logo" /></a>
  <a href="https://prettier.io/" target="blank"><img src="https://raw.githubusercontent.com/prettier/prettier/main/website/static/icon.png" height="80" alt="Prettier Logo" /></a>
  <a href="https://eslint.org/" target="blank"><img src="https://raw.githubusercontent.com/eslint/archive-website/e19d0bd4b5c116996f4cd94d4e90df5cc4367236/assets/img/logo.svg" height="80" alt="ESLint Logo" /></a>
  <a href="https://docs.docker.com/" target="blank"><img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" height="80" alt="Docker Logo" /></a>
</p>

<p align="center">
  <a href="https://github.com/features/actions" target="blank"><img src="https://avatars.githubusercontent.com/u/44036562" height="80" alt="GitHub Actions Logo" /></a>
  <a href="https://commitlint.js.org/" target="blank"><img src="https://raw.githubusercontent.com/conventional-changelog/commitlint/master/docs/public/assets/icon.svg" height="80" alt="CommitLint Logo" /></a>
  <a href="https://semantic-release.gitbook.io/semantic-release/" target="blank"><img src="https://raw.githubusercontent.com/semantic-release/semantic-release/master/media/semantic-release-logo.svg" height="80" alt="Semantic Release Logo" /></a>
  <a href="https://github.com/nestjs/swagger" target="blank"><img src="https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png" height="80" alt="Swagger Logo" /></a>
  <a href="https://www.fastify.io/" target="blank"><img src="https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg" height="80" alt="Fastify Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) boilerplate with [Typescript](https://www.typescriptlang.org/) 🎶, [Postgres](https://www.postgresql.org/) 🐬, [TypeORM](https://typeorm.io/) 🎉 and fully CI-CD with [GitHub Action](https://github.com/features/actions) 🏃‍♂️

## Features

- 🚀 NestJS with TypeScript
- 📦 PNPM as package manager
- 🗄️ PostgreSQL with TypeORM
- 📝 Swagger API documentation
- 🧪 Jest for testing
- 🎨 Prettier for code formatting
- 🔍 ESLint for code linting
- 🐳 Docker support
- 🔄 GitHub Actions for CI/CD
- 📝 Conventional Commits with CommitLint
- 🚀 Semantic Release for versioning

## Prerequisites

- Node.js (v22 or higher)
- PNPM (v8 or higher)
- PostgreSQL (v14 or higher)
- Docker (optional, for containerization)

## Setup GitHub Action Secret

1. Create a personal access token with `write:packages` scope [here](https://github.com/settings/tokens/new?scopes=write:packages,repo)
2. Add a secret `PAT` with the generated token value in your repository settings

## Installation

```bash
# Install dependencies
$ pnpm install

# Copy environment file
$ cp .env.example .env
```

## Configuration

1. Update the `.env` file with your database credentials and other configuration
2. Default configuration includes:
   - Database connection
   - JWT settings
   - API port
   - Swagger documentation settings

## Running the app

```bash
# development
$ pnpm start

# watch mode
$ pnpm start:dev

# production mode
$ pnpm start:prod

# debug mode
$ pnpm start:debug
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Testing

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov

# test watch mode
$ pnpm test:watch
```

## Database Management

```bash
# generate migration
$ pnpm migration:generate MigrationName
# or
$ pnpm build && pnpm typeorm migration:generate -p ./src/database/migrations/MigrationName

# run migration
$ pnpm migration:run

# revert migration
$ pnpm migration:revert

# drop schema
$ pnpm typeorm schema:drop

# create migration
$ pnpm migration:create MigrationName
```

## Docker Support

```bash
# Build image
$ docker build -t nest-boilerplate .

# Run container
$ docker run -p 3000:3000 nest-boilerplate
```

## Project Structure

```
src/
├── config/           # Configuration files
├── database/         # Database configuration and migrations
├── modules/          # Feature modules
├── common/           # Common utilities and decorators
├── filters/          # Exception filters
├── guards/           # Guards
├── interceptors/     # Interceptors
├── middlewares/      # Middlewares
├── pipes/            # Pipes
└── main.ts          # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
