import { PageMetaDto } from '@common/dto/page-meta.dto'
import { PaginationResponseDto } from '@common/dto/pagination-response.dto'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'

export const ApiPaginationResponse = <T extends Type<any>>(model: T) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
                nullable: false,
              },
              meta: {
                type: 'object',
                items: { $ref: getSchemaPath(PageMetaDto) },
              },
            },
          },
        ],
      },
    }),
    ApiExtraModels(model, PaginationResponseDto),
  )
}
