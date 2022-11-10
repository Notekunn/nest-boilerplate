import { Query } from '@nestjs-architects/typed-cqrs'

import { UserEntity } from '../../../entities/user.entity'

export class GetUserByIdQuery extends Query<UserEntity> {
  constructor(public readonly id: number) {
    super()
  }
}
