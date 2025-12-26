import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserTable1766720110464 implements MigrationInterface {
  name = 'AddUserTable1766720110464'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')
        `)
    await queryRunner.query(`
            CREATE TABLE "user" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "id" SERIAL NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "name" character varying,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "user"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `)
  }
}
