import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'

export class BaseEntity {
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date
}
