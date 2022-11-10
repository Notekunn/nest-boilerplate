import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { GetUserByIdQuery } from '../impl/get-user-by-id.query'

@CommandHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements ICommandHandler<GetUserByIdQuery> {
  async execute(_command: GetUserByIdQuery): Promise<any> {
    return _command.id
  }
}
