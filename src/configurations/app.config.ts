import { registerAs } from '@nestjs/config'

export interface AppConfiguration {
  readonly host: string
  readonly port: number
  readonly version: string
}

export const appConfiguration = registerAs<AppConfiguration>('app', () => {
  return {
    host: process.env.SERVICE_HOST || '0.0.0.0',
    port: +process.env.SERVICE_PORT || 3000,
    version: process.env.SERVICE_VERSION || process.env.npm_package_version || '0.0.0',
  }
})
