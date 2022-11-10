import { PrimaryGeneratedColumn } from 'typeorm'

import { BaseEntity } from './base.entity'

export class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number
}
