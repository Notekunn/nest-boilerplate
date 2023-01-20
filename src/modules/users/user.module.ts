import { TypeOrmExModule } from '@modules/typeorm-ex.module'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CaslModule } from 'nest-casl'

import { permissions } from './casl/user.permission'
import { UserController } from './controllers/user.controller'
import { UserAdminController } from './controllers/user-admin.controller'
import { UpdateUserCommandHandler } from './cqrs/commands/handler/update-user.handler'
import { GetUserByEmailQueryHandler } from './cqrs/queries/handler/get-user-by-email.handler'
import { GetUserByIdQueryHandler } from './cqrs/queries/handler/get-user-by-id.handler'
import { UserRepository } from './repositories/user.repository'

const QueryHandlers = [GetUserByEmailQueryHandler, GetUserByIdQueryHandler]
const CommandHandlers = [UpdateUserCommandHandler]

@Module({
  providers: [...QueryHandlers, ...CommandHandlers],
  controllers: [UserController, UserAdminController],
  imports: [
    CqrsModule,
    TypeOrmExModule.forCustomRepository([UserRepository]),
    CaslModule.forFeature({
      permissions,
    }),
  ],
})
export class UserModule {}
