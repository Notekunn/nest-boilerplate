import { Module } from '@nestjs/common'

import { UserController } from './controllers/user.controller'
import { UserAdminController } from './controllers/user-admin.controller'
import { GetUserByEmailQueryHandler } from './cqrs/queries/handler/get-user-by-email.handler'
import { GetUserByIdQueryHandler } from './cqrs/queries/handler/get-user-by-id.handler'

const QueryHandlers = [GetUserByEmailQueryHandler, GetUserByIdQueryHandler]
const CommandHandlers = []

@Module({
  providers: [...QueryHandlers, ...CommandHandlers],
  controllers: [UserController, UserAdminController],
})
export class UserModule {}
