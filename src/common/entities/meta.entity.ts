import { PrimaryGeneratedColumn } from 'typeorm'

import { NonPrimaryMetaEntity } from './non-primary-meta.entity'

export class MetaEntity extends NonPrimaryMetaEntity {
  @PrimaryGeneratedColumn()
  id: number
}
