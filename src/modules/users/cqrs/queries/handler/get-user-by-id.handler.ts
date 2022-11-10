import { UserRepository } from '@modules/users/repositories/user.repository'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { GetUserByIdQuery } from '../impl/get-user-by-id.query'

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(query: GetUserByIdQuery): Promise<any> {
    return this.userRepository.findOne({ where: { id: query.id } })
  }
}
