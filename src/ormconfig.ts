import { ConfigModule } from '@nestjs/config'
import { DataSource, DataSourceOptions } from 'typeorm'

import { typeormConfiguration } from './configurations/typeorm.config'

ConfigModule.forRoot({
  isGlobal: true,
  load: [typeormConfiguration],
})

export const typeormConfig = <DataSourceOptions>typeormConfiguration()

const dataSource = new DataSource(typeormConfig)

// eslint-disable-next-line import/no-default-export
export default dataSource
