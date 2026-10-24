-- ====================================================================
-- AVSI Scratch Card Inventory System - Database Setup
-- Run this in Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. USERS TABLE (Role-Based with SHA-256 Hashing)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'approver', 'manager', 'requester')),
  department TEXT CHECK (department IN ('Finance', 'Logistics', 'Program', 'Admin', 'Management')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CARD TYPES TABLE (Enhanced with entry_date and pin tracking support)
CREATE TABLE IF NOT EXISTS card_types (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  denomination INTEGER NOT NULL,
  currency TEXT DEFAULT 'IQD',
  category TEXT DEFAULT 'Mobile' CHECK (category IN ('Mobile', 'Internet')),
  min_stock_alert INTEGER DEFAULT 10,
  current_stock INTEGER DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  expiry_date DATE,
  entry_date DATE DEFAULT CURRENT_DATE,
  pin_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, denomination, category)
);

-- 4. CARD REQUESTS WORKFLOW TABLE
CREATE TABLE IF NOT EXISTS card_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('Finance', 'Logistics', 'Program', 'Admin')),
  card_type_id INTEGER REFERENCES card_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL,
  pin_numbers TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  executed_by TEXT,
  executed_at TIMESTAMPTZ,
  execution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RECEIPTS (STOCK IN) TABLE
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  card_type_id INTEGER NOT NULL REFERENCES card_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost REAL DEFAULT 0,
  total_value REAL DEFAULT 0,
  batch_number TEXT,
  supplier TEXT,
  date_received DATE NOT NULL,
  expiry_date DATE,
  pin_numbers TEXT,
  received_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ISSUANCES (STOCK OUT) TABLE
CREATE TABLE IF NOT EXISTS issuances (
  id SERIAL PRIMARY KEY,
  card_type_id INTEGER NOT NULL REFERENCES card_types(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES card_requests(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  requester_name TEXT NOT NULL,
  department TEXT,
  reason TEXT NOT NULL,
  date_issued DATE NOT NULL,
  pin_numbers TEXT,
  issued_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STOCK ADJUSTMENTS (PHYSICAL RECONCILIATION) TABLE
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

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  username TEXT,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies for Anon Key (Access controlled through application state)
DROP POLICY IF EXISTS "allow_all_users" ON users;
DROP POLICY IF EXISTS "allow_all_card_types" ON card_types;
DROP POLICY IF EXISTS "allow_all_card_requests" ON card_requests;
DROP POLICY IF EXISTS "allow_all_receipts" ON receipts;
DROP POLICY IF EXISTS "allow_all_issuances" ON issuances;
DROP POLICY IF EXISTS "allow_all_adjustments" ON stock_adjustments;
DROP POLICY IF EXISTS "allow_all_audit" ON audit_logs;

CREATE POLICY "allow_all_users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_card_types" ON card_types FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_card_requests" ON card_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_receipts" ON receipts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_issuances" ON issuances FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_adjustments" ON stock_adjustments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_audit" ON audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Ensure Realtime is enabled for instant sync
ALTER PUBLICATION supabase_realtime ADD TABLE card_types;
ALTER PUBLICATION supabase_realtime ADD TABLE card_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE issuances;

-- ====================================================================
-- SEED INITIAL CORE USERS (Alind, Yahia, Sample Manager, Sample Requester)
-- Passwords hashed using standard SHA-256
-- Default initial passwords:
-- Alind: Admin@2026! (SHA-256: 3c59a399e5257efbb601b38f8cf6de45d70f92271295fc7bfb60337da8df0989)
-- Yahia: Approver@2026! (SHA-256: 721fcdd23d72b53531f9b31f24d7775efd7ff553648ebc4a22ad321a4f0b2f56)
-- manager1: Manager@2026! (SHA-256: 1ee877fc576a0d01438318e8d89a7fb3a129ef3c242398b67f13904eb2023b8f)
-- requester1: Staff@2026! (SHA-256: 8c1c4b14d232822a1ce0114ae19c968945620958e0a3b2b4bc94cb68019b5e58)
-- ====================================================================
INSERT INTO users (username, password_hash, full_name, role, department)
VALUES
  ('alind', '3c59a399e5257efbb601b38f8cf6de45d70f92271295fc7bfb60337da8df0989', 'Alind (Admin & Safe Executor)', 'admin', 'Logistics'),
  ('yahia', '721fcdd23d72b53531f9b31f24d7775efd7ff553648ebc4a22ad321a4f0b2f56', 'Yahia (Request Approver)', 'approver', 'Management'),
  ('manager1', '1ee877fc576a0d01438318e8d89a7fb3a129ef3c242398b67f13904eb2023b8f', 'Management Viewer', 'manager', 'Management'),
  ('staff_finance', '8c1c4b14d232822a1ce0114ae19c968945620958e0a3b2b4bc94cb68019b5e58', 'Finance Staff', 'requester', 'Finance')
ON CONFLICT (username) DO UPDATE
SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;
