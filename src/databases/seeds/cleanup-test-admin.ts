import 'dotenv/config'

import { UserEntity } from '@modules/users/entities/user.entity'

import dataSource from '../../ormconfig'

/**
 * Cleanup script to remove test admin user from database.
 * Used after E2E testing to reset state.
 */
async function cleanup() {
  try {
    await dataSource.initialize()
    const userRepo = dataSource.getRepository(UserEntity)
    const email = 'admin@test.local'
    const user = await userRepo.findOne({ where: { email } })
    if (user) {
      await userRepo.remove(user)
      console.log(`CLEANUP: Deleted test admin user (${email})`)
    } else {
      console.log(`CLEANUP: Test admin user (${email}) not found`)
    }
  } catch (error) {
    console.error('Cleanup failed:', error)
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

cleanup()
