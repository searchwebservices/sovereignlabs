-- Remove legacy initiative statuses and enforce new lifecycle model.

DO $$
DECLARE
  status_udt text;
BEGIN
  SELECT udt_name
    INTO status_udt
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'initiatives'
    AND column_name = 'status';

  -- If initiatives.status is an enum, add new values first.
  IF status_udt IS NOT NULL AND status_udt NOT IN ('text', 'varchar', 'bpchar') THEN
    EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''suggested''', status_udt);
    EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''approved''', status_udt);
    EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''executing''', status_udt);
    EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''finalized''', status_udt);
    EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''archived''', status_udt);
  END IF;
END $$;
--> statement-breakpoint
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'initiatives'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%status%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.initiatives DROP CONSTRAINT IF EXISTS %I',
      constraint_name
    );
  END LOOP;
END $$;
--> statement-breakpoint
UPDATE "initiatives"
SET "status" = CASE
  WHEN "status" = 'planning' THEN 'suggested'
  WHEN "status" = 'active' THEN 'executing'
  WHEN "status" = 'completed' THEN 'finalized'
  ELSE "status"
END
WHERE "status" IN ('planning', 'active', 'completed');
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'initiatives'
      AND c.conname = 'initiatives_status_allowed'
  ) THEN
    ALTER TABLE "initiatives"
      ADD CONSTRAINT "initiatives_status_allowed"
      CHECK (
        "status" IN ('suggested', 'approved', 'executing', 'finalized', 'archived')
      );
  END IF;
END $$;
