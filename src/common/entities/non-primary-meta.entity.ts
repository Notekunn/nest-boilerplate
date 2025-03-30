import { AggregateRoot } from '@nestjs/cqrs'
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'

export class NonPrimaryMetaEntity extends AggregateRoot {
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date
}
