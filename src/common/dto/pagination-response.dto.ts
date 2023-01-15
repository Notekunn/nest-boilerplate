import { ApiProperty } from '@nestjs/swagger'

import { PageMetaDto } from './page-meta.dto'

export class PaginationResponseDto<T> {
  @ApiProperty()
  readonly data: T[]

  @ApiProperty({ type: PageMetaDto })
  readonly meta: PageMetaDto

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data
    this.meta = meta
  }
}
