FROM node:16-alpine as build

# Create app directory
WORKDIR /usr/src/build

# Install app dependencies
COPY ["package.json", "yarn.lock", "./"]

RUN yarn install --frozen-lockfile
# Bundle app source
COPY . .

RUN yarn build

RUN yarn install --frozen-lockfile --production=true 

FROM node:16-alpine as prod

WORKDIR /usr/src/app

COPY --from=build /usr/src/build/node_modules ./node_modules
COPY --from=build /usr/src/build/dist ./dist
COPY --from=build /usr/src/build/package.json ./package.json

CMD [ "yarn", "start:prod" ]

