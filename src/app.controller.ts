import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('/healthz')
  healthCheck() {
    const { npm_package_version, SERVICE_VERSION } = process.env
    return {
      version: `v${SERVICE_VERSION || npm_package_version}`,
    }
  }
}
