import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_students_payment_status" AS ENUM('unpaid', 'paid');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_enrollments_payment_status" AS ENUM('unpaid', 'paid');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    ALTER TABLE "students"
    ADD COLUMN IF NOT EXISTS "payment_status" "enum_students_payment_status" DEFAULT 'unpaid' NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "enrollments"
    ADD COLUMN IF NOT EXISTS "payment_status" "enum_enrollments_payment_status" DEFAULT 'unpaid' NOT NULL;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "students_payment_status_idx" ON "students" ("payment_status");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "enrollments_payment_status_idx" ON "enrollments" ("payment_status");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "enrollments_payment_status_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "students_payment_status_idx";`)
  await db.execute(sql`ALTER TABLE "enrollments" DROP COLUMN IF EXISTS "payment_status";`)
  await db.execute(sql`ALTER TABLE "students" DROP COLUMN IF EXISTS "payment_status";`)
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_enrollments_payment_status";`)
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_students_payment_status";`)
}
