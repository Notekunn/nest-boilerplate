import { HttpException } from '@nestjs/common'

export function makeErrorResponse(error: HttpException) {
  return {
    error: {
      status: error.getStatus(),
      message: error.message,
    },
  }
}
