import { UserEntity } from '@modules/users/entities/user.entity'
import { Column, JoinColumn, ManyToOne } from 'typeorm'

import { MetaEntity } from './meta.entity'

export class AbstractEntity extends MetaEntity {
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy?: UserEntity

  @Column({ nullable: true })
  createdById?: number
}
