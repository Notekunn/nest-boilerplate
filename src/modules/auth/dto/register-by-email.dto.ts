import { PASSWORD_VALIDATION } from '@common/constants/password-validation.constant'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterByEmailDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH, { message: PASSWORD_VALIDATION.MESSAGES.MIN_LENGTH })
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH, { message: PASSWORD_VALIDATION.MESSAGES.MAX_LENGTH })
  @Matches(PASSWORD_VALIDATION.REGEX, { message: PASSWORD_VALIDATION.MESSAGES.PATTERN })
  @ApiProperty({ minLength: PASSWORD_VALIDATION.MIN_LENGTH, maxLength: PASSWORD_VALIDATION.MAX_LENGTH })
  password: string
}
