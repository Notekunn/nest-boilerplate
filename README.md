<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[Nest](https://github.com/nestjs/nest) boilerplate with [Typescript](https://www.typescriptlang.org/) 🎶, [Postgres](https://www.postgresql.org/) 🐬, [TypeORM](https://typeorm.io/) 🎉and fully CI-CD with [GitHub Action](https://github.com/features/actions) 🏃‍♂️ and [GKE](https://cloud.google.com/kubernetes-engine) 🐳

## Setup Github Action Secret

- Create a personal access token with `write:packages` scope [here](https://github.com/settings/tokens/new?scopes=write:packages,repo).
- Add a secret `PAT` with above value

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
