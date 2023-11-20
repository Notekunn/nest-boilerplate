import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class TestNestedFilterDto {
  @ApiProperty()
  @IsNumber()
  version: number
}

export class TestFilterDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ type: TestNestedFilterDto })
  @Type(() => TestNestedFilterDto)
  @ValidateNested()
  nested?: TestNestedFilterDto
}
