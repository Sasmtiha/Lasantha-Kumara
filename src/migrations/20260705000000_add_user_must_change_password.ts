import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "must_change_password" boolean DEFAULT false NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users"
    DROP COLUMN IF EXISTS "must_change_password";
  `)
}
