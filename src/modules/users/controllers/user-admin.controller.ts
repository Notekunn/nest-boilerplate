import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller('user')
@ApiTags('user')
export class UserAdminController {}
