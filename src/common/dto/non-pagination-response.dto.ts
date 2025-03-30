import { ApiProperty } from '@nestjs/swagger'

export class NonPaginationResponseDto<T> {
  @ApiProperty()
  readonly data: T[]

  constructor(data: T[]) {
    this.data = data
  }
}
