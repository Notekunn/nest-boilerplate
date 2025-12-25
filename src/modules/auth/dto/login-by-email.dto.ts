import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength } from 'class-validator'

export class LoginByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @ApiProperty({ maxLength: 128 })
  password: string
}
