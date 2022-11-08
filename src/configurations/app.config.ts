import { registerAs } from '@nestjs/config'

export interface AppConfiguration {
  readonly host: string
  readonly port: number
}

export const appConfiguration = registerAs<AppConfiguration>('app', () => {
  return {
    host: process.env.SERVICE_HOST || '0.0.0.0',
    port: +process.env.SERVICE_PORT || 3000,
  }
})
