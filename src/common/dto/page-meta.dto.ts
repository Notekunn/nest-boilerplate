import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

import { PaginationDto } from './pagination.dto'

export class PageMetaDto {
  @ApiProperty()
  @Type(() => Number)
  readonly page: number

  @ApiProperty()
  @Type(() => Number)
  readonly take: number

  @ApiProperty()
  readonly itemCount: number

  @ApiProperty()
  readonly pageCount: number

  constructor(paginationDto: PaginationDto, itemCount: number) {
    this.page = paginationDto.page
    this.take = paginationDto.take
    this.itemCount = itemCount
    this.pageCount = Math.ceil(itemCount / this.take)
  }
}
