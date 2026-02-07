-- ============================================================
-- Tasks & Purchases — Table Setup
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Team Members ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT,
  role        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to team_members"
  ON team_members FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo',
  priority    TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to tasks"
  ON tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── Purchases ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name        TEXT NOT NULL,
  description      TEXT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  estimated_cost   NUMERIC,
  vendor           TEXT,
  status           TEXT NOT NULL DEFAULT 'needed',
  priority         TEXT NOT NULL DEFAULT 'medium',
  linked_device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  linked_part_id   UUID REFERENCES parts(id) ON DELETE SET NULL,
  requested_by     UUID REFERENCES team_members(id) ON DELETE SET NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to purchases"
  ON purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── Auto-update updated_at triggers ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Verify ────────────────────────────────────────────────────
SELECT 'team_members' AS entity, COUNT(*) AS count FROM team_members
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases;
