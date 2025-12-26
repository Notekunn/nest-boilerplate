import { DataSource } from 'typeorm'

/**
 * Abstract base class for all seeders.
 * Provides consistent interface for seed operations.
 */
export abstract class BaseSeeder {
  /** Unique seeder name (used for --only flag) */
  abstract readonly name: string

  /** Human-readable description */
  abstract readonly description: string

  /**
   * Execute the seeding logic.
   * Implementations should be idempotent (skip if data exists).
   */
  abstract run(dataSource: DataSource): Promise<void>
}
