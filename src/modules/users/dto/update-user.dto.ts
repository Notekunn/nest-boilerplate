import { PASSWORD_VALIDATION } from '@common/constants/password-validation.constant'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    minLength: PASSWORD_VALIDATION.MIN_LENGTH,
    maxLength: PASSWORD_VALIDATION.MAX_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MinLength(PASSWORD_VALIDATION.MIN_LENGTH, { message: PASSWORD_VALIDATION.MESSAGES.MIN_LENGTH })
  @MaxLength(PASSWORD_VALIDATION.MAX_LENGTH, { message: PASSWORD_VALIDATION.MESSAGES.MAX_LENGTH })
  @Matches(PASSWORD_VALIDATION.REGEX, { message: PASSWORD_VALIDATION.MESSAGES.PATTERN })
  password?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string
}
