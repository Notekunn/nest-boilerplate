import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  readonly logger = new Logger(AllExceptionsFilter.name)
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception.message, exception.stack)
    }

    if (process.env.NODE_ENV !== 'production') {
      return response.status(status).send({
        error: {
          code: status,
          message: exception.message,
          stack: exception.stack,
        },
      })
    }
    return response.status(status).send({
      error: {
        code: status,
        message: exception.message,
      },
    })
  }
}
