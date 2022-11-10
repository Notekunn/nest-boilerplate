import { AbstractEntity } from '@common/entities/abstract.entity'
import { Column, Entity } from 'typeorm'

@Entity('user')
export class UserEntity extends AbstractEntity {
  @Column()
  email: string

  @Column()
  password: string
}
