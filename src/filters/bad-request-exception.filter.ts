import { BadRequestException, Catch, ExceptionFilter, ExecutionContext, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ValidationError } from 'class-validator'
import { FastifyReply } from 'fastify'
import { isArray, isEmpty, snakeCase } from 'lodash'

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(public readonly reflector: Reflector) {}

  catch(exception: BadRequestException, host: ExecutionContext): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    let statusCode = exception.getStatus()
    const r = <any>exception.getResponse()

    if (isArray(r.message) && r.message[0] instanceof ValidationError) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY
      const validationErrors = r.message as ValidationError[]
      this._validationFilter(validationErrors)
    }

    r.statusCode = statusCode

    response.status(statusCode).send(r)
  }

  private _validationFilter(validationErrors: readonly ValidationError[]): void {
    for (const validationError of validationErrors) {
      for (const [constraintKey, constraint] of Object.entries(validationError.constraints || {})) {
        // convert default messages
        if (!constraint && validationError.constraints) {
          // convert error message to error.fields.{key} syntax for i18n translation
          validationError.constraints[constraintKey] = `error.fields.${snakeCase(constraintKey)}`
        }
      }
      if (!isEmpty(validationError.children)) {
        this._validationFilter(validationError.children || [])
      }
    }
  }
}
