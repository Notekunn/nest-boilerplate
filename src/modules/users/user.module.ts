import { Module } from '@nestjs/common'

import { UserController } from './controllers/user.controller'
import { UserAdminController } from './controllers/user-admin.controller'

const QueryHandlers = []
const CommandHandlers = []

@Module({
  providers: [...QueryHandlers, ...CommandHandlers],
  controllers: [UserController, UserAdminController],
})
export class UserModule {}
