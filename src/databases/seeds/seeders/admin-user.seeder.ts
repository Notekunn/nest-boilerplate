import { DataSource } from 'typeorm'

import { BaseSeeder } from '../base.seeder'

/**
 * Placeholder seeder for admin user creation.
 * Full implementation will be added in Phase 2.
 */
export class AdminUserSeeder extends BaseSeeder {
  readonly name = 'admin-user'
  readonly description = 'Seeds default admin user account'

  async run(_dataSource: DataSource): Promise<void> {
    // TODO: Implement in Phase 2
    console.log('  -> AdminUserSeeder: Placeholder - implement in Phase 2')
  }
}
