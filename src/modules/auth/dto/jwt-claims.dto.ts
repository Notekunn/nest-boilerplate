import { Roles } from '@common/enum/role.enum'
import { ApiProperty } from '@nestjs/swagger'

export class JwtClaimsDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  @ApiProperty({
    enum: Roles,
    isArray: true,
  })
  roles: Roles[]
}
