import { UserEntity } from '@modules/users/entities/user.entity'
import { Column, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from './base.entity'

export class AbstractEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy?: UserEntity

  @Column({ nullable: true })
  createdById?: number
}
