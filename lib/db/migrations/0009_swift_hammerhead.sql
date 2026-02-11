-- Add richer task-detail entities + research drive support.

ALTER TABLE IF EXISTS "team_members"
ADD COLUMN IF NOT EXISTS "is_ai" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
INSERT INTO "team_members" ("id", "name", "email", "role", "is_ai")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sovereign AI',
  'ai@sovereignlabs.local',
  'ai_assistant',
  true
)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_subtasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "is_done" boolean NOT NULL DEFAULT false,
  "assigned_to" uuid REFERENCES "team_members"("id") ON DELETE SET NULL,
  "due_date" date,
  "order_index" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_subtasks_task_id_idx"
  ON "task_subtasks" ("task_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_subtasks_assigned_to_idx"
  ON "task_subtasks" ("assigned_to");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "url" text NOT NULL,
  "content_type" text,
  "file_size" bigint,
  "uploaded_by" uuid REFERENCES "team_members"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_files_task_id_idx"
  ON "task_files" ("task_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_meetings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "meeting_date" timestamptz,
  "meeting_url" text,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_meetings_task_id_idx"
  ON "task_meetings" ("task_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_mentions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "member_id" uuid NOT NULL REFERENCES "team_members"("id") ON DELETE CASCADE,
  "context" text,
  "status" text NOT NULL DEFAULT 'new',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "task_mentions_task_member_unique" UNIQUE ("task_id", "member_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_mentions_member_id_idx"
  ON "task_mentions" ("member_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "research_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "initiative_id" uuid REFERENCES "initiatives"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "summary" text,
  "content" text,
  "source_document_id" uuid,
  "source_chat_id" uuid,
  "storage_url" text,
  "status" text NOT NULL DEFAULT 'draft',
  "created_by" uuid REFERENCES "team_members"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "research_documents_initiative_id_idx"
  ON "research_documents" ("initiative_id");
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_task_subtasks_updated_at'
  ) THEN
    CREATE TRIGGER update_task_subtasks_updated_at
      BEFORE UPDATE ON task_subtasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_task_meetings_updated_at'
  ) THEN
    CREATE TRIGGER update_task_meetings_updated_at
      BEFORE UPDATE ON task_meetings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_task_mentions_updated_at'
  ) THEN
    CREATE TRIGGER update_task_mentions_updated_at
      BEFORE UPDATE ON task_mentions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_research_documents_updated_at'
  ) THEN
    CREATE TRIGGER update_research_documents_updated_at
      BEFORE UPDATE ON research_documents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE IF EXISTS "task_subtasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "task_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "task_meetings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "task_mentions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "research_documents" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'task_subtasks'
      AND policyname = 'Allow all access to task_subtasks'
  ) THEN
    CREATE POLICY "Allow all access to task_subtasks"
      ON "task_subtasks" FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'task_files'
      AND policyname = 'Allow all access to task_files'
  ) THEN
    CREATE POLICY "Allow all access to task_files"
      ON "task_files" FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'task_meetings'
      AND policyname = 'Allow all access to task_meetings'
  ) THEN
    CREATE POLICY "Allow all access to task_meetings"
      ON "task_meetings" FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'task_mentions'
      AND policyname = 'Allow all access to task_mentions'
  ) THEN
    CREATE POLICY "Allow all access to task_mentions"
      ON "task_mentions" FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'research_documents'
      AND policyname = 'Allow all access to research_documents'
  ) THEN
    CREATE POLICY "Allow all access to research_documents"
      ON "research_documents" FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
