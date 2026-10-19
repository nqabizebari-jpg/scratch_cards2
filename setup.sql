-- ============================================
-- Safe Card Inventory - Supabase Database Setup
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Users table (simple password auth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supervisor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card types (inventory items)
CREATE TABLE IF NOT EXISTS card_types (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  denomination INTEGER NOT NULL,
  currency TEXT DEFAULT 'IQD',
  category TEXT DEFAULT 'Mobile',
  min_stock_alert INTEGER DEFAULT 10,
  current_stock INTEGER DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, denomination, category)
);

-- Stock receipts (stock in)
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  card_type_id INTEGER NOT NULL REFERENCES card_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_cost REAL DEFAULT 0,
  total_value REAL DEFAULT 0,
  batch_number TEXT,
  supplier TEXT,
  date_received DATE NOT NULL,
  expiry_date DATE,
  received_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock issuances (stock out)
CREATE TABLE IF NOT EXISTS issuances (
  id SERIAL PRIMARY KEY,
  card_type_id INTEGER NOT NULL REFERENCES card_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  requester_name TEXT NOT NULL,
  department TEXT,
  reason TEXT NOT NULL,
  date_issued DATE NOT NULL,
  issued_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock adjustments (reconciliation)
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  card_type_id INTEGER NOT NULL REFERENCES card_types(id) ON DELETE CASCADE,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  difference INTEGER NOT NULL,
  reason TEXT NOT NULL,
  adjusted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  username TEXT,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon access
CREATE POLICY "allow_all_users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_card_types" ON card_types FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_receipts" ON receipts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_issuances" ON issuances FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_adjustments" ON stock_adjustments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_audit" ON audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE card_types;
ALTER PUBLICATION supabase_realtime ADD TABLE receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE issuances;

-- Default Users
INSERT INTO users (username, password, full_name, role) VALUES
  ('supervisor', 'admin123', 'بکارئینەرێ ئێکێ (User 1)', 'supervisor'),
  ('operator', 'user123', 'بکارئینەرێ دووێ (User 2)', 'supervisor')
ON CONFLICT (username) DO NOTHING;

-- Default Card Types
INSERT INTO card_types (provider, denomination, category, min_stock_alert, current_stock, unit_cost, expiry_date) VALUES
  ('Asiacell', 5000, 'Mobile', 15, 50, 4900, '2027-10-19'),
  ('Asiacell', 10000, 'Mobile', 15, 40, 9800, '2027-10-19'),
  ('Asiacell', 25000, 'Mobile', 10, 20, 24500, '2027-10-19'),
  ('Korek Telecom', 5000, 'Mobile', 15, 60, 4900, '2027-10-19'),
  ('Korek Telecom', 10000, 'Mobile', 15, 45, 9800, '2027-10-19'),
  ('Korek Telecom', 25000, 'Mobile', 10, 25, 24500, '2027-10-19'),
  ('Zain Iraq', 5000, 'Mobile', 10, 30, 4900, '2027-10-19'),
  ('Zain Iraq', 10000, 'Mobile', 10, 25, 9800, '2027-10-19'),
  ('Fastlink', 10000, 'Internet', 10, 30, 9700, '2027-10-19'),
  ('Fastlink', 25000, 'Internet', 10, 20, 24300, '2027-10-19'),
  ('Newroz 4G', 15000, 'Internet', 10, 25, 14600, '2027-10-19')
ON CONFLICT DO NOTHING;
