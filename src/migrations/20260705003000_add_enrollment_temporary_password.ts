import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "enrollments"
    ADD COLUMN IF NOT EXISTS "temporary_password" text;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "enrollments"
    DROP COLUMN IF EXISTS "temporary_password";
  `)
}
