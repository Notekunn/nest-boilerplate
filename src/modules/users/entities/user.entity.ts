import { AbstractEntity } from '@common/entities/abstract.entity'
import { Exclude } from 'class-transformer'
import { Column, Entity } from 'typeorm'

@Entity('user')
export class UserEntity extends AbstractEntity {
  @Column()
  email: string

  @Column()
  @Exclude()
  password: string
}
