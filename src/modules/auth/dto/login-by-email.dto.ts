import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class LoginByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  password: string
}
