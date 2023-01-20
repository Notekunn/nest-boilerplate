import { Injectable } from '@nestjs/common'
import { Request, SubjectBeforeFilterHook } from 'nest-casl'

import { UserEntity } from '../entities/user.entity'
import { UserRepository } from '../repositories/user.repository'

@Injectable()
export class UserHook implements SubjectBeforeFilterHook<UserEntity, Request> {
  constructor(private readonly userRepository: UserRepository) {}
  async run({ params }: Request) {
    return this.userRepository.create({
      id: params.id,
    })
  }
}
