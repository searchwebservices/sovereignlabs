-- ============================================================
-- Migration: NextAuth → Supabase Auth
-- Run this in the Supabase SQL Editor
-- ============================================================
--
-- BEFORE running this SQL:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Click "Add user" → "Create new user"
--   3. Email: bay@searchwebservices.tech
--   4. Set a password
--   5. Copy the new user's UUID from the dashboard
--   6. Replace 'NEW_AUTH_UUID_HERE' below with that UUID
-- ============================================================

-- Step 1: Auto-create team_members on Supabase Auth signup
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists first to avoid duplicate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Step 2: Drop FK constraints from Chat, Document, Suggestion → User
-- ────────────────────────────────────────────────────────────
ALTER TABLE "Chat" DROP CONSTRAINT IF EXISTS "Chat_userId_User_id_fk";
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_userId_User_id_fk";
ALTER TABLE "Suggestion" DROP CONSTRAINT IF EXISTS "Suggestion_userId_User_id_fk";

-- Step 3: Migrate existing data to new Supabase Auth UUID
-- ────────────────────────────────────────────────────────────
-- ⚠️ REPLACE 'NEW_AUTH_UUID_HERE' with the actual UUID from step above!
-- The old UUID for bay@searchwebservices.tech is: f25d6281-acee-4557-9071-3a287194ca22

-- UPDATE "Chat"       SET "userId" = 'NEW_AUTH_UUID_HERE' WHERE "userId" = 'f25d6281-acee-4557-9071-3a287194ca22';
-- UPDATE "Document"   SET "userId" = 'NEW_AUTH_UUID_HERE' WHERE "userId" = 'f25d6281-acee-4557-9071-3a287194ca22';
-- UPDATE "Suggestion" SET "userId" = 'NEW_AUTH_UUID_HERE' WHERE "userId" = 'f25d6281-acee-4557-9071-3a287194ca22';

-- Step 4: Clean up guest data (optional — uncomment if you want to remove guest chats)
-- DELETE FROM "Vote_v2" WHERE "chatId" IN (SELECT "id" FROM "Chat" WHERE "userId" IN ('1b71dfa1-3c45-4144-a280-b2ec56a45239','96dce245-9c14-4660-9376-8aa3db539f00'));
-- DELETE FROM "Message_v2" WHERE "chatId" IN (SELECT "id" FROM "Chat" WHERE "userId" IN ('1b71dfa1-3c45-4144-a280-b2ec56a45239','96dce245-9c14-4660-9376-8aa3db539f00'));
-- DELETE FROM "Stream" WHERE "chatId" IN (SELECT "id" FROM "Chat" WHERE "userId" IN ('1b71dfa1-3c45-4144-a280-b2ec56a45239','96dce245-9c14-4660-9376-8aa3db539f00'));
-- DELETE FROM "Chat" WHERE "userId" IN ('1b71dfa1-3c45-4144-a280-b2ec56a45239','96dce245-9c14-4660-9376-8aa3db539f00');

-- Step 5: Drop the old User table
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "User";

-- Step 6: Create team_members row for Bay (if not already created by trigger)
-- ────────────────────────────────────────────────────────────
-- INSERT INTO team_members (id, name, email, role)
-- VALUES ('NEW_AUTH_UUID_HERE', 'Bay', 'bay@searchwebservices.tech', 'Admin')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Done! Verify:
-- ============================================================
SELECT 'team_members' AS entity, COUNT(*) AS count FROM team_members;
