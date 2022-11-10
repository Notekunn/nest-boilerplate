import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
