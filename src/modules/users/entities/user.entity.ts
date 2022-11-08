import { AbstractEntity } from '@common/entities/abstract.entity'
import { Entity } from 'typeorm'

@Entity('user')
export class UserEntity extends AbstractEntity {}
