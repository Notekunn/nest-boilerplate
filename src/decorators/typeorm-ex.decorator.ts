import { SetMetadata } from '@nestjs/common'
import { ObjectLiteral } from 'typeorm'

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY'

export function CustomRepository(entity: ObjectLiteral): ClassDecorator {
  return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity)
}
