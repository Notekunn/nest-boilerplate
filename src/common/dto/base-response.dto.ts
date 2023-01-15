import { ApiProperty } from '@nestjs/swagger'

export class BaseResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  deletedAt?: Date
}
