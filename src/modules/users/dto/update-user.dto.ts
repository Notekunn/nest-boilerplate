import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string
}
