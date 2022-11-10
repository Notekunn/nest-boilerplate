import { registerAs } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const jwtConfiguration = registerAs<JwtModuleOptions>('jwt', () => ({
  secret: process.env.JWT_SECRET_KEY || 'secret',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION_TIME || '7d',
  },
}))
