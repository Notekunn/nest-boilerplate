import { registerAs } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'
import type { StringValue } from 'ms'

export const jwtConfiguration = registerAs<JwtModuleOptions>('jwt', () => ({
  secret: process.env.JWT_SECRET_KEY,
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRATION_TIME || '7d') as StringValue,
  },
}))
