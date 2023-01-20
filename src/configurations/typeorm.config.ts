import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

import { SnakeNamingStrategy } from '../snake-naming.strategy'

export const typeormConfiguration = registerAs<TypeOrmModuleOptions>('orm', () => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    namingStrategy: new SnakeNamingStrategy(),
    migrationsTableName: '__migrations',
    entities: ['dist/modules/**/*.entity.js'],
    migrations: ['dist/databases/{migrations,seeds}/*.js'],
    migrationsRun: process.env.DB_AUTO_RUN_MIGRATIONS === 'true',
    synchronize: process.env.DB_AUTO_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  }
})
