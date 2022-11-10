import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class RegisterByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  password: string
}
