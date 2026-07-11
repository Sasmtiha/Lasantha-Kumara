import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_payment_slips_status" AS ENUM('pending', 'approved', 'rejected');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "resource_files" (
      "id" serial PRIMARY KEY NOT NULL,
      "alt" varchar,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payment_slips" (
      "id" serial PRIMARY KEY NOT NULL,
      "student_id" integer NOT NULL,
      "user_id" integer NOT NULL,
      "month" varchar NOT NULL,
      "grade_level" varchar NOT NULL,
      "status" "enum_payment_slips_status" DEFAULT 'pending' NOT NULL,
      "admin_notes" varchar,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );
  `)

  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "resource_files_filename_idx" ON "resource_files" ("filename");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "resource_files_created_at_idx" ON "resource_files" ("created_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "resource_files_updated_at_idx" ON "resource_files" ("updated_at");`)

  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "payment_slips_filename_idx" ON "payment_slips" ("filename");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payment_slips_student_idx" ON "payment_slips" ("student_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payment_slips_user_idx" ON "payment_slips" ("user_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payment_slips_month_idx" ON "payment_slips" ("month");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payment_slips_status_idx" ON "payment_slips" ("status");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payment_slips_created_at_idx" ON "payment_slips" ("created_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payment_slips_updated_at_idx" ON "payment_slips" ("updated_at");`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payment_slips"
      ADD CONSTRAINT "payment_slips_student_id_students_id_fk"
      FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payment_slips"
      ADD CONSTRAINT "payment_slips_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "resources" DROP CONSTRAINT IF EXISTS "resources_file_id_media_id_fk";
  `)

  await db.execute(sql`
    UPDATE "resources" SET "file_id" = null WHERE "file_id" IS NOT NULL;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "resources"
      ADD CONSTRAINT "resources_file_id_resource_files_id_fk"
      FOREIGN KEY ("file_id") REFERENCES "resource_files"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "resources" DROP CONSTRAINT IF EXISTS "resources_file_id_resource_files_id_fk";`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "resources"
      ADD CONSTRAINT "resources_file_id_media_id_fk"
      FOREIGN KEY ("file_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`DROP TABLE IF EXISTS "payment_slips";`)
  await db.execute(sql`DROP TABLE IF EXISTS "resource_files";`)
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_payment_slips_status";`)
}
