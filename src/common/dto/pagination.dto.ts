import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class PaginationDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number = 1

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take: number = 30

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly q?: string

  get skip(): number {
    return (this.page - 1) * this.take
  }

  get paginationDto() {
    return {
      take: this.take,
      skip: this.skip,
      page: this.page,
    }
  }

  constructor(partial: Partial<PaginationDto>) {
    Object.assign(this, partial)
  }
}
