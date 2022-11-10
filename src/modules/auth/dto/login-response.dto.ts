import { UserResponseDto } from '@modules/users/dto/user-response.dto'
import { ApiProperty } from '@nestjs/swagger'

import { TokenResponseDto } from './token-response.dto'

export class LoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto

  @ApiProperty({ type: TokenResponseDto })
  token: TokenResponseDto
}
