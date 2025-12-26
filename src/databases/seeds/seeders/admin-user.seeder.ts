import { Roles } from '@common/enum/role.enum'
import { UserEntity } from '@modules/users/entities/user.entity'
import { generateHash } from '@shared/security.utils'
import { DataSource } from 'typeorm'

import { BaseSeeder } from '../base.seeder'

/**
 * Seeds admin user for E2E testing.
 * Reads credentials from ADMIN_EMAIL and ADMIN_PASSWORD env vars.
 * Idempotent: skips if admin already exists.
 */
export class AdminUserSeeder extends BaseSeeder {
  readonly name = 'admin'
  readonly description = 'Create admin user for E2E testing'

  async run(dataSource: DataSource): Promise<void> {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    // Validate env vars
    if (!email || !password) {
      console.log('  SKIP: ADMIN_EMAIL or ADMIN_PASSWORD not set')
      return
    }

    const userRepo = dataSource.getRepository(UserEntity)

    // Idempotency check
    const existing = await userRepo.findOne({ where: { email } })
    if (existing) {
      console.log(`  SKIP: Admin user already exists (${email})`)
      return
    }

    // Create admin user
    const hashedPassword = await generateHash(password)
    const admin = userRepo.create({
      email,
      password: hashedPassword,
      name: 'Admin',
      role: Roles.Admin,
    })

    await userRepo.save(admin)
    console.log(`  CREATED: Admin user (${email}) with role=${Roles.Admin}`)
  }
}
