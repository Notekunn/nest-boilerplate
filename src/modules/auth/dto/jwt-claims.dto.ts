import { Roles } from '@common/enum/role.enum'
import { ApiProperty } from '@nestjs/swagger'

export class JwtClaimsDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  //TODO: add roles
  @ApiProperty({
    enum: Roles,
    isArray: true,
  })
  roles: Roles[]
}
