import { UserEntity } from '@modules/users/entities/user.entity'

export interface AuthenticatedRequest {
  user: UserEntity
}
