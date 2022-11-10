import { ApiProperty } from '@nestjs/swagger'

export class TokenResponseDto {
  @ApiProperty()
  token: string

  @ApiProperty()
  expiresIn: Date

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial)
  }
}
