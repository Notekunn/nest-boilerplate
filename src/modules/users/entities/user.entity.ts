import { BaseEntity } from '@common/entities/base.entity'
import { Exclude } from 'class-transformer'
import { Column, Entity } from 'typeorm'

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column()
  email: string

  @Column()
  @Exclude()
  password: string
}
