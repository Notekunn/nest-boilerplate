import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @ApiProperty({ minLength: 1, maxLength: 128 })
  password: string
}
