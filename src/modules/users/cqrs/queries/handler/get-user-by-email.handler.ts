import { UserRepository } from '@modules/users/repositories/user.repository'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { GetUserByEmailQuery } from '../impl/get-user-by-email.query'

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(_query: GetUserByEmailQuery): Promise<any> {
    return this.userRepository.findOne({ where: { email: _query.email } })
  }
}
