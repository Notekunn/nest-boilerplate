# Codebase Summary

## Overview
This is a production-ready NestJS boilerplate using Fastify, TypeORM, and PostgreSQL. It implements modern development patterns including CQRS, CASL for authorization, and comprehensive testing strategies.

## Architecture
- **Framework**: NestJS 11 with Fastify
- **Pattern**: CQRS (Command Query Responsibility Segregation)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication
- **Authorization**: CASL-based fine-grained access control
- **Validation**: class-validator for DTO validation
- **Documentation**: Swagger (OpenAPI 3.0)

## Core Modules
- `auth`: Handles registration, login, and JWT strategy
- `users`: User management including profile updates
- `common`: Global constants, DTOs, and entities
- `configurations`: Environment-based configuration management
- `databases`: Database migrations, ORM setup, and seed infrastructure

## Development Standards
- **Commits**: Conventional Commits enforced via CommitLint
- **Versioning**: Automated via Semantic Release
- **Testing**: Jest for unit and E2E tests
- **Linting**: ESLint and Prettier for code style

## Security (Phase 1 Fixes)
- **Password Validation**: Enforced 8-128 characters with complexity (uppercase, lowercase, digits, special characters)
- **JWT Integrity**: Validate user existence in `JwtStrategy` to prevent stale tokens for deleted users
- **Seed Infrastructure**: CLI-based seeding with production guards and single-seeder execution support
