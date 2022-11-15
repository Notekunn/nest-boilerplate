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
  <a href="https://cloud.google.com/kubernetes-engine" target="blank"><img src="https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.png" height="80" alt="Kubernetes Logo" /></a>
  <a href="https://commitlint.js.org/" target="blank"><img src="https://raw.githubusercontent.com/conventional-changelog/commitlint/master/docs/assets/icon.svg" height="80" alt="CommitLint Logo" /></a>
  <a href="https://semantic-release.gitbook.io/semantic-release/" target="blank"><img src="https://raw.githubusercontent.com/semantic-release/semantic-release/master/media/semantic-release-logo.svg" height="80" alt="Semantic Release Logo" /></a>
  <a href="https://github.com/nestjs/swagger" target="blank"><img src="https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png" height="80" alt="CommitLint Logo" /></a>
  <a href="https://www.fastify.io/" target="blank"><img src="https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg" height="80" alt="Fastify Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) boilerplate with [Typescript](https://www.typescriptlang.org/) 🎶, [Postgres](https://www.postgresql.org/) 🐬, [TypeORM](https://typeorm.io/) 🎉and fully CI-CD with [GitHub Action](https://github.com/features/actions) 🏃‍♂️ and [GKE](https://cloud.google.com/kubernetes-engine) 🐳

## Setup Github Action Secret

- Create a personal access token with `write:packages` scope [here](https://github.com/settings/tokens/new?scopes=write:packages,repo).
- Add a secret `PAT` with above value

## Setup Google Cloud

- Install Google Cloud CLI [here](https://cloud.google.com/sdk/docs/install)
- Setup Google Cloud CLI with `gcloud init` and create a project with billing account
- Enable Container Registry API:

```bash
  gcloud services enable containerregistry.googleapis.com container.googleapis.com
```

- Config environment variables:

```bash
  export GKE_PROJECT=$(gcloud config get-value project)
  export GKE_CLUSTER=nest-cluster
  export GKE_ZONE=asia-southeast1-a
  export SA_NAME=gke-sa
  export SA_EMAIL=${SA_NAME}@${GKE_PROJECT}.iam.gserviceaccount.com
```

- Create a service account:

```bash
  gcloud iam service-accounts create $SA_NAME --display-name "GKE Service Account"
```

- Add role to service account:

```bash
  gcloud projects add-iam-policy-binding $GKE_PROJECT --member serviceAccount:$SA_EMAIL --role roles/container.admin
  gcloud projects add-iam-policy-binding $GKE_PROJECT --member serviceAccount:$SA_EMAIL --role roles/storage.admin
  gcloud projects add-iam-policy-binding $GKE_PROJECT --member serviceAccount:$SA_EMAIL --role roles/container.clusterViewer
  gcloud projects add-iam-policy-binding $GKE_PROJECT --member serviceAccount:$SA_EMAIL --role roles/iam.serviceAccountTokenCreator
```

- Export service account key:

```bash
  gcloud iam service-accounts keys create key.json --iam-account $SA_EMAIL
  export GKE_SA_KEY=$(cat key.json | base64)
```

- Add `GKE_PROJECT`, `GKE_CLUSTER`, `GKE_ZONE`, `GKE_SA_KEY`, to Github Action Secret

## Setup GKE

- Create cluster

```bash
 gcloud container clusters create $GKE_CLUSTER --zone $GKE_ZONE --machine-type n1-standard-1
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn start
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## TypeORM

```bash
# generate migration
yarn migration:generate MigrationName
# or
yarn build && yarn typeorm migration:generate -p ./src/database/migrations/MigrationName

# run migration
yarn migration:run
```

- Other commands:

```bash
# drop schema
yarn typeorm schema:drop

# create migration
yarn migration:create MigrationName

```
