import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('app')
export class AppController {
  @Get('/healthz')
  healthCheck() {
    const { npm_package_version, SERVICE_VERSION } = process.env
    return {
      version: `v${SERVICE_VERSION || npm_package_version}`,
    }
  }
}
