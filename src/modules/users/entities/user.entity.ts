import { MetaEntity } from '@common/entities/meta.entity'
import { Roles } from '@common/enum/role.enum'
import { Exclude } from 'class-transformer'
import { Column, Entity } from 'typeorm'

@Entity('user')
export class UserEntity extends MetaEntity {
  @Column()
  email: string

  @Column()
  @Exclude()
  password: string

  @Column({ nullable: true })
  name: string

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.User,
  })
  role: Roles
}
