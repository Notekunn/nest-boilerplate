import { ApiProperty } from '@nestjs/swagger'

export class JwtClaimsDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  //TODO: add roles
}
