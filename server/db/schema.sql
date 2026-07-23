-- =====================================================================
-- NEXUS DESKTOP - POS SCHEMA
-- MySQL 8.0+ / InnoDB / utf8mb4
-- Multi-tenant: shared database, business_id scoping
-- =====================================================================

DROP DATABASE IF EXISTS nexus_desktop;
-- NOTE: utf8mb4_0900_ai_ci requires MySQL 8.0+ (matches your Workbench target).
-- If you ever run this on MariaDB, swap it for utf8mb4_unicode_ci.
CREATE DATABASE nexus_desktop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE nexus_desktop;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- SECTION 1: PLATFORM CATALOG (global, not tenant-scoped)
-- Seeded reference data owned by the super admin.
-- =====================================================================

-- Business modules shown on the "Choose Your Business Module" screen.
-- Adding a row here surfaces a new tile in the UI; the `code` is what the
-- application switches on to decide which satellite product table to use.
CREATE TABLE modules (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code            VARCHAR(32)  NOT NULL,   -- 'pharmacy','grocery','electronics',...
  name            VARCHAR(64)  NOT NULL,   -- 'Pharmacy'
  tagline         VARCHAR(128) NULL,       -- 'MEDICINE AND RX'
  icon            VARCHAR(64)  NULL,       -- icon key for the frontend tile
  is_available    TINYINT(1)   NOT NULL DEFAULT 1,  -- 0 => renders as "MORE SOON"
  display_order   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_modules_code (code)
) ENGINE=InnoDB;

-- Business type dropdown on the Business Details form.
CREATE TABLE business_types (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code            VARCHAR(32) NOT NULL,
  name            VARCHAR(64) NOT NULL,
  display_order   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_business_types_code (code)
) ENGINE=InnoDB;

-- Fixed subscription tiers (Backup & Plan screen).
-- Retention length is the differentiator: 3mo/Rs1,500 - 6mo/Rs2,200 etc.
CREATE TABLE plans (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code                  VARCHAR(32)  NOT NULL,   -- 'retention_6m'
  name                  VARCHAR(64)  NOT NULL,   -- '6 month'
  retention_months      SMALLINT UNSIGNED NOT NULL,
  monthly_price         DECIMAL(12,2) NOT NULL,
  currency              CHAR(3)      NOT NULL DEFAULT 'PKR',
  is_active             TINYINT(1)   NOT NULL DEFAULT 1,
  display_order         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plans_code (code)
) ENGINE=InnoDB;

-- Backup data categories ("Sales & POS data", "Inventory records").
-- Each selected category adds `monthly_price` to the estimated monthly cost.
CREATE TABLE backup_modules (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code            VARCHAR(32)  NOT NULL,   -- 'sales_pos','inventory'
  name            VARCHAR(64)  NOT NULL,
  description     VARCHAR(191) NULL,
  monthly_price   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  display_order   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_backup_modules_code (code)
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 2: IDENTITY & AUTH
-- =====================================================================

-- One row per human. role='super_admin' rows have no business.
-- role='admin' rows own exactly one business (enforced by businesses.owner_user_id UNIQUE).
CREATE TABLE users (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username            VARCHAR(64)  NOT NULL,
  email               VARCHAR(191) NOT NULL,
  phone               VARCHAR(24)  NULL,
  password_hash       VARCHAR(255) NULL,     -- NULL when the account is OAuth-only
  role                ENUM('super_admin','admin','user') NOT NULL DEFAULT 'admin',
  status              ENUM('pending','active','suspended','blocked') NOT NULL DEFAULT 'pending',
  city_region         VARCHAR(96)  NULL,     -- captured on the Account form
  email_verified_at   TIMESTAMP    NULL,
  last_login_at       TIMESTAMP    NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB;

-- Google / Facebook sign-in on the signup screen.
CREATE TABLE oauth_accounts (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  provider        ENUM('google','facebook') NOT NULL,
  provider_uid    VARCHAR(191) NOT NULL,
  provider_email  VARCHAR(191) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_oauth_provider_uid (provider, provider_uid),
  UNIQUE KEY uq_oauth_user_provider (user_id, provider),
  CONSTRAINT fk_oauth_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Refresh-token sessions. Store a hash, never the raw token.
-- "Remember me" simply extends expires_at.
CREATE TABLE sessions (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  refresh_token_hash  CHAR(64)     NOT NULL,   -- sha256 hex
  user_agent          VARCHAR(255) NULL,
  ip_address          VARBINARY(16) NULL,      -- INET6_ATON()
  remember_me         TINYINT(1)   NOT NULL DEFAULT 0,
  expires_at          TIMESTAMP    NOT NULL,
  revoked_at          TIMESTAMP    NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token (refresh_token_hash),
  KEY idx_sessions_user (user_id, expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- "Forgot Password?" flow.
CREATE TABLE password_resets (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  token_hash      CHAR(64)  NOT NULL,
  expires_at      TIMESTAMP NOT NULL,
  used_at         TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_resets_token (token_hash),
  KEY idx_password_resets_user (user_id, expires_at),
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Failed/successful login attempts, for rate limiting the
-- "Invalid username or password" path. Keyed by identifier, not user_id,
-- because a failed attempt may not resolve to a real user.
CREATE TABLE login_attempts (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  identifier      VARCHAR(191)  NOT NULL,   -- submitted username/email
  ip_address      VARBINARY(16) NULL,
  was_successful  TINYINT(1)    NOT NULL DEFAULT 0,
  attempted_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_login_attempts_lookup (identifier, attempted_at)
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 3: REGISTRATION WIZARD
-- =====================================================================

-- "Save draft" persistence for the 4-step wizard.
-- One draft per user; `payload` holds partially-filled form state so the
-- client can rehydrate exactly where the owner left off. It is deliberately
-- schemaless: draft data is transient and half-valid by definition, and
-- promoting it to typed columns would mean every column is nullable anyway.
-- On "Finish setup" the payload is validated and written to real tables,
-- then the draft row is deleted.
CREATE TABLE registration_drafts (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  current_step        TINYINT UNSIGNED NOT NULL DEFAULT 1,  -- 1..4
  payload             JSON NOT NULL,
  last_saved_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_registration_drafts_user (user_id),
  CONSTRAINT fk_drafts_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_drafts_step CHECK (current_step BETWEEN 1 AND 4)
) ENGINE=InnoDB;

-- The tenant root. Every tenant-scoped table below carries business_id.
-- owner_user_id is UNIQUE => strict 1:1 user↔business.
CREATE TABLE businesses (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id       BIGINT UNSIGNED NOT NULL,
  module_id           BIGINT UNSIGNED NOT NULL,   -- single-select, step 3
  business_type_id    BIGINT UNSIGNED NULL,
  name                VARCHAR(128) NOT NULL,      -- 'Fairy Parcel Co'
  location            VARCHAR(128) NULL,          -- 'City, area'
  city_region         VARCHAR(96)  NULL,          -- 'Karachi, Sindh'
  shop_address        VARCHAR(255) NULL,          -- delivery address for backup devices/invoices
  is_registered       TINYINT(1)   NOT NULL DEFAULT 0,  -- 'Yes, registered' / 'Not registered'
  nic_number          VARCHAR(24)  NULL,          -- required only when is_registered = 1
  currency            CHAR(3)      NOT NULL DEFAULT 'PKR',
  timezone            VARCHAR(64)  NOT NULL DEFAULT 'Asia/Karachi',
  status              ENUM('active','suspended','blocked') NOT NULL DEFAULT 'active',
  bill_status         ENUM('paid','overdue','staff_request','upgrade_request') NOT NULL DEFAULT 'paid',
  pos_purchased       INT UNSIGNED NOT NULL DEFAULT 1,
  pos_active          INT UNSIGNED NOT NULL DEFAULT 1,
  onboarding_status   ENUM('in_progress','completed') NOT NULL DEFAULT 'in_progress',
  terms_accepted_at   TIMESTAMP    NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_businesses_owner (owner_user_id),
  KEY idx_businesses_module (module_id),
  KEY idx_businesses_status (status),
  CONSTRAINT fk_businesses_owner FOREIGN KEY (owner_user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_businesses_module FOREIGN KEY (module_id)
    REFERENCES modules(id),
  CONSTRAINT fk_businesses_type FOREIGN KEY (business_type_id)
    REFERENCES business_types(id),
  -- A registered business must supply an NIC.
  CONSTRAINT chk_businesses_nic
    CHECK (is_registered = 0 OR nic_number IS NOT NULL)
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 4: SUBSCRIPTION / BACKUP & PLAN
-- Current selection only, per your spec. History is intentionally omitted
-- but can be added later as `subscription_history` without touching this.
-- =====================================================================

CREATE TABLE subscriptions (
  id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id             BIGINT UNSIGNED NOT NULL,
  plan_id                 BIGINT UNSIGNED NOT NULL,
  platform                ENUM('web_app','mobile_pos','both') NOT NULL DEFAULT 'web_app',
  payment_method          ENUM('card','bank_transfer','jazzcash_easypaisa') NOT NULL,
  -- Snapshot of computed cost at setup time, so a later price change to
  -- `plans` doesn't silently rewrite what the owner agreed to.
  plan_price              DECIMAL(12,2) NOT NULL,
  backup_modules_price    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estimated_monthly_cost  DECIMAL(12,2) NOT NULL,
  currency                CHAR(3)   NOT NULL DEFAULT 'PKR',
  status                  ENUM('active','past_due','cancelled') NOT NULL DEFAULT 'active',
  started_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriptions_business (business_id),   -- current selection only
  KEY idx_subscriptions_plan (plan_id),
  CONSTRAINT fk_subscriptions_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id)
    REFERENCES plans(id)
) ENGINE=InnoDB;

-- Which data categories the owner ticked for backup (multi-select).
CREATE TABLE subscription_backup_modules (
  subscription_id     BIGINT UNSIGNED NOT NULL,
  backup_module_id    BIGINT UNSIGNED NOT NULL,
  unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,  -- price snapshot
  PRIMARY KEY (subscription_id, backup_module_id),
  KEY idx_sbm_backup_module (backup_module_id),
  CONSTRAINT fk_sbm_subscription FOREIGN KEY (subscription_id)
    REFERENCES subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_sbm_backup_module FOREIGN KEY (backup_module_id)
    REFERENCES backup_modules(id)
) ENGINE=InnoDB;

-- Super Admin Request Workflow (Additional POS terminals, plan upgrades, module changes)
CREATE TABLE shop_requests (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id         BIGINT UNSIGNED NOT NULL,
  request_type        ENUM('pos_terminal','plan_upgrade','module_change','other') NOT NULL,
  title               VARCHAR(191) NOT NULL,
  details             TEXT NULL,
  status              ENUM('Pending','Approved','Rejected','Resubmit') NOT NULL DEFAULT 'Pending',
  reviewed_by_user_id BIGINT UNSIGNED NULL,
  reviewed_at         TIMESTAMP NULL,
  rejection_reason    TEXT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_shop_requests_business (business_id),
  KEY idx_shop_requests_status (status),
  CONSTRAINT fk_shop_requests_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_shop_requests_reviewer FOREIGN KEY (reviewed_by_user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 5: CORE POS - CATALOG
-- Shared `products` table = every field common to all modules.
-- Module-specific fields live in 1:1 satellite tables (Section 6), so
-- sale_items / stock_movements never branch on module.
-- =====================================================================

CREATE TABLE categories (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id     BIGINT UNSIGNED NOT NULL,
  parent_id       BIGINT UNSIGNED NULL,
  name            VARCHAR(96) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_business_name (business_id, name),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
    REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE suppliers (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id     BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(128) NOT NULL,
  contact_person  VARCHAR(96)  NULL,
  phone           VARCHAR(24)  NULL,
  email           VARCHAR(191) NULL,
  address         VARCHAR(255) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_suppliers_business (business_id, name),
  CONSTRAINT fk_suppliers_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE customers (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id     BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(128) NOT NULL,
  phone           VARCHAR(24)  NULL,
  email           VARCHAR(191) NULL,
  address         VARCHAR(255) NULL,
  loyalty_points  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_customers_business_phone (business_id, phone),
  KEY idx_customers_business_name (business_id, name),
  CONSTRAINT fk_customers_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE products (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id         BIGINT UNSIGNED NOT NULL,
  category_id         BIGINT UNSIGNED NULL,
  supplier_id         BIGINT UNSIGNED NULL,
  sku                 VARCHAR(64)  NOT NULL,
  barcode             VARCHAR(64)  NULL,
  name                VARCHAR(191) NOT NULL,
  description         TEXT         NULL,
  unit                VARCHAR(24)  NOT NULL DEFAULT 'pcs',  -- pcs, kg, litre, box
  cost_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sale_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate            DECIMAL(5,2)  NOT NULL DEFAULT 0.00,  -- percent
  stock_quantity      DECIMAL(12,3) NOT NULL DEFAULT 0.000, -- decimal => weighed goods
  reorder_level       DECIMAL(12,3) NOT NULL DEFAULT 0.000, -- low-stock alerts
  is_active           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_business_sku (business_id, sku),
  UNIQUE KEY uq_products_business_barcode (business_id, barcode),
  KEY idx_products_business_name (business_id, name),
  KEY idx_products_category (category_id),
  KEY idx_products_supplier (supplier_id),
  CONSTRAINT fk_products_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT chk_products_prices CHECK (cost_price >= 0 AND sale_price >= 0)
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 6: MODULE-SPECIFIC PRODUCT TABLES (1:1 with products)
-- A business only ever writes to the satellite matching its module.
-- New module => add a table here + a row in `modules`. Nothing else changes.
-- =====================================================================

CREATE TABLE pharmacy_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  generic_name        VARCHAR(191) NULL,
  brand_name          VARCHAR(191) NULL,
  manufacturer        VARCHAR(128) NULL,
  batch_number        VARCHAR(64)  NULL,
  expiry_date         DATE         NULL,
  dosage_form         VARCHAR(48)  NULL,   -- tablet, syrup, injection
  strength            VARCHAR(48)  NULL,   -- '500mg'
  requires_prescription TINYINT(1) NOT NULL DEFAULT 0,
  is_controlled       TINYINT(1)   NOT NULL DEFAULT 0,
  storage_conditions  VARCHAR(128) NULL,
  PRIMARY KEY (product_id),
  KEY idx_pharmacy_expiry (expiry_date),
  KEY idx_pharmacy_batch (batch_number),
  CONSTRAINT fk_pharmacy_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE grocery_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  brand               VARCHAR(128) NULL,
  expiry_date         DATE         NULL,
  is_perishable       TINYINT(1)   NOT NULL DEFAULT 0,
  is_weighed          TINYINT(1)   NOT NULL DEFAULT 0,  -- priced per kg at the scale
  package_size        VARCHAR(48)  NULL,   -- '1kg', '500ml'
  country_of_origin   VARCHAR(64)  NULL,
  PRIMARY KEY (product_id),
  KEY idx_grocery_expiry (expiry_date),
  CONSTRAINT fk_grocery_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE electronics_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  brand               VARCHAR(128) NULL,
  model_number        VARCHAR(96)  NULL,
  serial_number       VARCHAR(96)  NULL,
  warranty_months     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  power_rating        VARCHAR(48)  NULL,
  condition_type      ENUM('new','refurbished','used') NOT NULL DEFAULT 'new',
  PRIMARY KEY (product_id),
  KEY idx_electronics_serial (serial_number),
  KEY idx_electronics_model (model_number),
  CONSTRAINT fk_electronics_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bakery_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  baked_on            DATE         NULL,
  best_before         DATE         NULL,
  shelf_life_hours    SMALLINT UNSIGNED NULL,
  contains_allergens  VARCHAR(191) NULL,   -- 'nuts, dairy, gluten'
  is_custom_order     TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id),
  KEY idx_bakery_best_before (best_before),
  CONSTRAINT fk_bakery_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE restaurant_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  course_type         VARCHAR(48)  NULL,   -- starter, main, dessert, beverage
  preparation_minutes SMALLINT UNSIGNED NULL,
  is_vegetarian       TINYINT(1)   NOT NULL DEFAULT 0,
  spice_level         ENUM('none','mild','medium','hot') NOT NULL DEFAULT 'none',
  contains_allergens  VARCHAR(191) NULL,
  -- Dishes are made to order, so on-hand stock is usually meaningless.
  is_stock_tracked    TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_restaurant_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE general_store_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  brand               VARCHAR(128) NULL,
  package_size        VARCHAR(48)  NULL,
  expiry_date         DATE         NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_general_store_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE clothing_products (
  product_id          BIGINT UNSIGNED NOT NULL,
  brand               VARCHAR(128) NULL,
  size                VARCHAR(24)  NULL,   -- S, M, L, 32, 8.5
  color               VARCHAR(48)  NULL,
  material            VARCHAR(96)  NULL,
  gender              ENUM('men','women','unisex','kids') NOT NULL DEFAULT 'unisex',
  season              VARCHAR(32)  NULL,
  PRIMARY KEY (product_id),
  KEY idx_clothing_size_color (size, color),
  CONSTRAINT fk_clothing_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Restaurant tables (dine-in). Only used by the restaurant module.
CREATE TABLE restaurant_tables (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id     BIGINT UNSIGNED NOT NULL,
  table_number    VARCHAR(24) NOT NULL,
  seats           TINYINT UNSIGNED NOT NULL DEFAULT 2,
  status          ENUM('available','occupied','reserved') NOT NULL DEFAULT 'available',
  PRIMARY KEY (id),
  UNIQUE KEY uq_tables_business_number (business_id, table_number),
  CONSTRAINT fk_tables_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 7: SALES
-- =====================================================================

-- Cash drawer / till session. Opened and closed by the admin per shift;
-- gives you the expected-vs-counted reconciliation on the dashboard.
CREATE TABLE registers (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id         BIGINT UNSIGNED NOT NULL,
  opened_by_user_id   BIGINT UNSIGNED NOT NULL,
  opening_float       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  closing_amount      DECIMAL(12,2) NULL,
  expected_amount     DECIMAL(12,2) NULL,
  status              ENUM('open','closed') NOT NULL DEFAULT 'open',
  opened_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at           TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_registers_business_status (business_id, status),
  CONSTRAINT fk_registers_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_registers_user FOREIGN KEY (opened_by_user_id)
    REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE sales (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id         BIGINT UNSIGNED NOT NULL,
  register_id         BIGINT UNSIGNED NULL,
  customer_id         BIGINT UNSIGNED NULL,
  user_id             BIGINT UNSIGNED NOT NULL,   -- who rang it up
  table_id            BIGINT UNSIGNED NULL,       -- restaurant module only
  invoice_number      VARCHAR(48) NOT NULL,
  status              ENUM('completed','refunded','partially_refunded','void') NOT NULL DEFAULT 'completed',
  subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  paid_amount         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  change_amount       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  note                VARCHAR(255) NULL,
  sold_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sales_business_invoice (business_id, invoice_number),
  -- Drives the "1.2k orders today" tile and every date-ranged report.
  KEY idx_sales_business_date (business_id, sold_at),
  KEY idx_sales_customer (customer_id),
  KEY idx_sales_register (register_id),
  KEY idx_sales_user (user_id),
  KEY idx_sales_table (table_id),
  CONSTRAINT fk_sales_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_sales_register FOREIGN KEY (register_id)
    REFERENCES registers(id) ON DELETE SET NULL,
  CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_sales_user FOREIGN KEY (user_id)
    REFERENCES users(id),
  CONSTRAINT fk_sales_table FOREIGN KEY (table_id)
    REFERENCES restaurant_tables(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Line items. product_name/unit_price are snapshots: renaming or repricing
-- a product must never rewrite last month's receipts.
CREATE TABLE sale_items (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sale_id             BIGINT UNSIGNED NOT NULL,
  product_id          BIGINT UNSIGNED NULL,   -- NULL if product later deleted
  product_name        VARCHAR(191) NOT NULL,
  quantity            DECIMAL(12,3) NOT NULL,
  unit_price          DECIMAL(12,2) NOT NULL,
  cost_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,  -- for profit reports
  discount_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate            DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  tax_amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  line_total          DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sale_items_sale (sale_id),
  KEY idx_sale_items_product (product_id),
  CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id)
    REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT chk_sale_items_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

-- Split tender: one sale may have several payment rows.
CREATE TABLE payments (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sale_id             BIGINT UNSIGNED NOT NULL,
  method              ENUM('cash','card','bank_transfer','jazzcash_easypaisa','credit') NOT NULL,
  amount              DECIMAL(12,2) NOT NULL,
  reference           VARCHAR(96) NULL,   -- txn id / last4
  paid_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_sale (sale_id),
  CONSTRAINT fk_payments_sale FOREIGN KEY (sale_id)
    REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE refunds (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sale_id             BIGINT UNSIGNED NOT NULL,
  user_id             BIGINT UNSIGNED NOT NULL,
  reason              VARCHAR(255) NULL,
  total_amount        DECIMAL(12,2) NOT NULL,
  refunded_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_refunds_sale (sale_id),
  KEY idx_refunds_user (user_id),
  CONSTRAINT fk_refunds_sale FOREIGN KEY (sale_id)
    REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_refunds_user FOREIGN KEY (user_id)
    REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refund_items (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  refund_id           BIGINT UNSIGNED NOT NULL,
  sale_item_id        BIGINT UNSIGNED NOT NULL,
  quantity            DECIMAL(12,3) NOT NULL,
  amount              DECIMAL(12,2) NOT NULL,
  restock             TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_refund_items_refund (refund_id),
  KEY idx_refund_items_sale_item (sale_item_id),
  CONSTRAINT fk_refund_items_refund FOREIGN KEY (refund_id)
    REFERENCES refunds(id) ON DELETE CASCADE,
  CONSTRAINT fk_refund_items_sale_item FOREIGN KEY (sale_item_id)
    REFERENCES sale_items(id),
  CONSTRAINT chk_refund_items_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 8: PURCHASING & INVENTORY
-- =====================================================================

CREATE TABLE purchases (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id         BIGINT UNSIGNED NOT NULL,
  supplier_id         BIGINT UNSIGNED NULL,
  user_id             BIGINT UNSIGNED NOT NULL,
  reference_number    VARCHAR(48) NOT NULL,
  status              ENUM('draft','ordered','received','cancelled') NOT NULL DEFAULT 'draft',
  subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ordered_at          TIMESTAMP NULL,
  received_at         TIMESTAMP NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_purchases_business_ref (business_id, reference_number),
  KEY idx_purchases_business_date (business_id, created_at),
  KEY idx_purchases_supplier (supplier_id),
  KEY idx_purchases_user (user_id),
  CONSTRAINT fk_purchases_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT fk_purchases_user FOREIGN KEY (user_id)
    REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE purchase_items (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purchase_id         BIGINT UNSIGNED NOT NULL,
  product_id          BIGINT UNSIGNED NULL,
  product_name        VARCHAR(191) NOT NULL,
  quantity            DECIMAL(12,3) NOT NULL,
  received_quantity   DECIMAL(12,3) NOT NULL DEFAULT 0.000,
  unit_cost           DECIMAL(12,2) NOT NULL,
  line_total          DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_purchase_items_purchase (purchase_id),
  KEY idx_purchase_items_product (product_id),
  CONSTRAINT fk_purchase_items_purchase FOREIGN KEY (purchase_id)
    REFERENCES purchases(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_items_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT chk_purchase_items_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

-- Append-only ledger of every stock change. products.stock_quantity is the
-- fast cached balance; this table is the auditable "why". reference_type /
-- reference_id point back at the sale, purchase, refund or adjustment.
CREATE TABLE stock_movements (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id         BIGINT UNSIGNED NOT NULL,
  product_id          BIGINT UNSIGNED NOT NULL,
  user_id             BIGINT UNSIGNED NULL,
  movement_type       ENUM('sale','purchase','refund','adjustment','damage','expiry','opening') NOT NULL,
  quantity_change     DECIMAL(12,3) NOT NULL,   -- negative for outflow
  balance_after       DECIMAL(12,3) NOT NULL,
  reference_type      VARCHAR(32) NULL,         -- 'sale','purchase','refund'
  reference_id        BIGINT UNSIGNED NULL,
  note                VARCHAR(255) NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stock_movements_product (product_id, created_at),
  KEY idx_stock_movements_business (business_id, created_at),
  KEY idx_stock_movements_reference (reference_type, reference_id),
  KEY idx_stock_movements_user (user_id),
  CONSTRAINT fk_stock_movements_business FOREIGN KEY (business_id)
    REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_movements_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- SECTION 9: SEED DATA
-- =====================================================================

INSERT INTO modules (code, name, tagline, icon, is_available, display_order) VALUES
  ('pharmacy',      'Pharmacy',      'MEDICINE AND RX',   'syringe',   1, 1),
  ('grocery',       'Grocery',       'DAILY ESSENTIALS',  'cart',      1, 2),
  ('electronics',   'Electronics',   'DEVICES AND PARTS', 'laptop',    1, 3),
  ('bakery',        'Bakery',        'FRESH GOODS',       'bread',     1, 4),
  ('restaurant',    'Restaurant',    'DINE AND SERVE',    'utensils',  1, 5),
  ('general_store', 'General Store', 'MULTI-CATEGORY',    'store',     1, 6),
  ('clothing',      'Clothing',      'APPAREL AND WEAR',  'shirt',     1, 7);

INSERT INTO business_types (code, name, display_order) VALUES
  ('pharmacy', 'Pharmacy', 1),
  ('grocery', 'Grocery', 2),
  ('electronics', 'Electronics', 3),
  ('bakery', 'Bakery', 4),
  ('restaurant', 'Restaurant', 5),
  ('general_store', 'General Store', 6),
  ('clothing', 'Clothing', 7),
  ('other', 'Other', 99);

INSERT INTO plans (code, name, retention_months, monthly_price, display_order) VALUES
  ('retention_3m',  '3 month',  3,  1500.00, 1),
  ('retention_6m',  '6 month',  6,  2200.00, 2),
  ('retention_12m', '12 month', 12, 3500.00, 3);

INSERT INTO backup_modules (code, name, description, monthly_price, display_order) VALUES
  ('sales_pos', 'Sales & POS data', 'Daily transactions, receipts, refunds.', 150.00, 1),
  ('inventory', 'Inventory records', 'Stock levels, products, suppliers.',    150.00, 2);

-- =====================================================================
-- SECTION 10: HELPER VIEWS (dashboard tiles)
-- =====================================================================

-- Backs the "1.2k orders today" figure.
CREATE OR REPLACE VIEW v_daily_sales_summary AS
SELECT
  s.business_id,
  DATE(s.sold_at)        AS sale_date,
  COUNT(*)               AS order_count,
  SUM(s.total_amount)    AS gross_revenue,
  SUM(s.discount_amount) AS total_discounts,
  SUM(s.tax_amount)      AS total_tax
FROM sales s
WHERE s.status IN ('completed','partially_refunded')
GROUP BY s.business_id, DATE(s.sold_at);

CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT
  p.business_id,
  p.id AS product_id,
  p.name,
  p.sku,
  p.stock_quantity,
  p.reorder_level
FROM products p
WHERE p.is_active = 1
  AND p.stock_quantity <= p.reorder_level;
