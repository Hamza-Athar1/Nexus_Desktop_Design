-- ═══════════════════════════════════════════════════════════════════
-- Nexus Desktop — MySQL Schema (current, as of Inventory API task)
-- Run this whole file in MySQL Workbench to create a database that
-- matches the current state of the project exactly.
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS nexus_desktop;
USE nexus_desktop;

-- ── users ──────────────────────────────────────────────────────────
-- Core auth table. One row per account. Created at signup.
CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  business_name  VARCHAR(255) NOT NULL,
  business_type  VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  username       VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(50) NOT NULL DEFAULT 'user',  -- 'user' | 'admin' | 'super-admin'
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── refresh_tokens ────────────────────────────────────────────────
-- Backs the JWT refresh flow. A user can have multiple active
-- sessions; logout deletes just that session's row.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token       VARCHAR(500) NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── business_profiles ────────────────────────────────────────────
-- One-to-one with users. Extended business/profile info that isn't
-- auth-related. Auto-created (empty-ish) at signup, filled in via
-- the Edit Profile screen. subscription_status here is a CACHED
-- read for fast dashboard display — subscriptions (below) is the
-- real source of truth and is what keeps this column in sync.
CREATE TABLE IF NOT EXISTS business_profiles (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  user_id                 INT NOT NULL UNIQUE,
  business_name           VARCHAR(255),
  business_type           VARCHAR(255),
  owner_name              VARCHAR(255),
  phone                   VARCHAR(50),
  license_no              VARCHAR(100),
  logo_url                VARCHAR(500),
  gst_number              VARCHAR(50),
  ntn_number              VARCHAR(50),
  fbr_enabled             BOOLEAN NOT NULL DEFAULT false,
  auto_gst                BOOLEAN NOT NULL DEFAULT false,
  selected_module         VARCHAR(50),   -- 'pharmacy' | 'grocery' | 'electronics' | 'bakery' | 'restaurant' | 'general-store' | 'clothing'
  subscription_status     VARCHAR(50) NOT NULL DEFAULT 'trial',
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── subscriptions ─────────────────────────────────────────────────
-- Source of truth for billing/plan status. Auto-created as
-- ('trial','pending') at signup. Admins update status via
-- PATCH /admin/subscriptions/:id/approve, which also syncs
-- business_profiles.subscription_status for that user.
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  plan          VARCHAR(50) NOT NULL DEFAULT 'trial',
  status        VARCHAR(50) NOT NULL DEFAULT 'pending',  -- e.g. 'pending' | 'active' | 'expired'
  payment_date  DATE NULL,
  renews_at     DATE NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── inventory_items ───────────────────────────────────────────────
-- Every business's stock. Scoped per user_id — one user only ever
-- sees their own items via the API. module_specific_fields is a
-- free-form JSON object for per-module extras, e.g.:
--   Pharmacy: { "batch_no": "...", "expiry_date": "...", "manufacturer": "..." }
--   Clothing: { "sizes": ["S","M","L"], "colors": ["Red","Navy"] }
--   Grocery:  { "unit": "KG", "supplier_name": "...", "expiry_date": "..." }
CREATE TABLE IF NOT EXISTS inventory_items (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  user_id                 INT NOT NULL,
  name                    VARCHAR(255) NOT NULL,
  sku                     VARCHAR(100),
  barcode                 VARCHAR(100),
  category                VARCHAR(100),
  stock_qty               INT NOT NULL DEFAULT 0,
  reorder_level           INT NOT NULL DEFAULT 0,
  price                   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  module_specific_fields  JSON,
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_barcode (user_id, barcode),
  INDEX idx_user_sku (user_id, sku)
);
