import { BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

export class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string
}
