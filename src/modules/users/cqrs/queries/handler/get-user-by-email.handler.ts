import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { GetUserByEmailQuery } from '../impl/get-user-by-email.query'

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler implements IQueryHandler<GetUserByEmailQuery> {
  execute(_query: GetUserByEmailQuery): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
