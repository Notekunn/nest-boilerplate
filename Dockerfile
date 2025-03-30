FROM node:22-slim AS build

RUN corepack enable

# Create app directory
WORKDIR /usr/src/build

# Install app dependencies
COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm build

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

FROM node:22-alpine AS prod

WORKDIR /usr/src/app

COPY --from=build /usr/src/build/node_modules ./node_modules
COPY --from=build /usr/src/build/dist ./dist
COPY --from=build /usr/src/build/package.json ./package.json

CMD [ "pnpm", "start:prod" ]

