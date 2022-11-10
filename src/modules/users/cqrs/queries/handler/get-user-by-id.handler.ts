import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { GetUserByIdQuery } from '../impl/get-user-by-id.query'

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  async execute(_command: GetUserByIdQuery): Promise<any> {
    return _command.id
  }
}
