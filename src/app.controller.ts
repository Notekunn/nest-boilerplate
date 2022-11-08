import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'

import { AppConfiguration } from './configurations/app.config'

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/healthz')
  healthCheck() {
    const { version } = this.configService.get<AppConfiguration>('app')
    return {
      version: `v${version}`,
    }
  }
}
