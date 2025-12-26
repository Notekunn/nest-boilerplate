import { ApiProperty } from '@nestjs/swagger'

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  token: string

  @ApiProperty({ description: 'Token expiration timestamp' })
  expiresAt: Date

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial)
  }
}
