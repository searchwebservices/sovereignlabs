-- Internal drive backed by Supabase Postgres (no external blob dependency).

CREATE TABLE IF NOT EXISTS "internal_drive_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "content_type" text NOT NULL,
  "size_bytes" bigint NOT NULL,
  "data" bytea NOT NULL,
  "scope" text NOT NULL DEFAULT 'general',
  "is_public" boolean NOT NULL DEFAULT false,
  "created_by_user_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "internal_drive_files_created_at_idx"
  ON "internal_drive_files" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "internal_drive_files_scope_idx"
  ON "internal_drive_files" ("scope");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "internal_drive_files_is_public_idx"
  ON "internal_drive_files" ("is_public");
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_internal_drive_files_updated_at'
  ) THEN
    CREATE TRIGGER update_internal_drive_files_updated_at
      BEFORE UPDATE ON internal_drive_files
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE IF EXISTS "task_files"
ADD COLUMN IF NOT EXISTS "drive_file_id" uuid REFERENCES "internal_drive_files"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE IF EXISTS "research_documents"
ADD COLUMN IF NOT EXISTS "drive_file_id" uuid REFERENCES "internal_drive_files"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_files_drive_file_id_idx"
  ON "task_files" ("drive_file_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "research_documents_drive_file_id_idx"
  ON "research_documents" ("drive_file_id");
--> statement-breakpoint
ALTER TABLE IF EXISTS "internal_drive_files" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'internal_drive_files'
      AND policyname = 'Allow all access to internal_drive_files'
  ) THEN
    CREATE POLICY "Allow all access to internal_drive_files"
      ON "internal_drive_files" FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
