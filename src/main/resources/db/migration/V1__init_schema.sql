CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE kyc_tier AS ENUM ('TIER_1_BASIC', 'TIER_2_FULL');
CREATE TYPE agent_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED');
CREATE TYPE account_type AS ENUM ('CUSTOMER_WALLET', 'AGENT_FLOAT', 'AGENT_COMMISSION', 'PLATFORM_REVENUE', 'TAX_LIABILITY', 'VOUCHER_HOLDING');
CREATE TYPE transaction_type AS ENUM ('CASH_IN', 'CASH_OUT', 'A2A_TRANSFER', 'VOUCHER_ISSUE', 'VOUCHER_REDEEM');
CREATE TYPE entry_direction AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE voucher_status AS ENUM ('ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'POSTED', 'REVERSED', 'FAILED');

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    date_of_birth       DATE NOT NULL,
    primary_mobile      VARCHAR(20) NOT NULL UNIQUE,
    secondary_mobile    VARCHAR(20) UNIQUE,
    email               VARCHAR(150),
    kyc_tier            kyc_tier NOT NULL DEFAULT 'TIER_1_BASIC',
    nid_number          VARCHAR(50) UNIQUE,
    id_document_type    VARCHAR(50),
    id_document_ref     VARCHAR(100),
    province            VARCHAR(100),
    district            VARCHAR(100),
    llg                 VARCHAR(100),
    village             VARCHAR(150),
    phone_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    photo_reference     VARCHAR(255),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_offline     BOOLEAN NOT NULL DEFAULT FALSE,
    enrolled_by_agent_id UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_mobile_format CHECK (primary_mobile ~ '^\+?[0-9]{7,15}$'),
    CONSTRAINT chk_tier2_requires_doc CHECK (
        kyc_tier = 'TIER_1_BASIC'
        OR (kyc_tier = 'TIER_2_FULL' AND (nid_number IS NOT NULL OR id_document_ref IS NOT NULL))
    )
);

CREATE INDEX idx_customers_primary_mobile ON customers(primary_mobile);
CREATE INDEX idx_customers_secondary_mobile ON customers(secondary_mobile);
CREATE INDEX idx_customers_nid ON customers(nid_number);
CREATE INDEX idx_customers_kyc_tier ON customers(kyc_tier);
CREATE INDEX idx_customers_province_district ON customers(province, district);

-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE agents (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_code              VARCHAR(30) NOT NULL UNIQUE,
    full_name               VARCHAR(150) NOT NULL,
    primary_mobile          VARCHAR(20) NOT NULL UNIQUE,
    status                  agent_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
    device_imei             VARCHAR(50),
    device_mac              VARCHAR(50),
    device_fingerprint_hash VARCHAR(255) NOT NULL UNIQUE,
    province                VARCHAR(100),
    district                VARCHAR(100),
    llg                     VARCHAR(100),
    village_or_location     VARCHAR(150),
    latitude                NUMERIC(9,6),
    longitude               NUMERIC(9,6),
    daily_cashout_limit     NUMERIC(15,2) NOT NULL DEFAULT 5000.00,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_agent_mobile_format CHECK (primary_mobile ~ '^\+?[0-9]{7,15}$')
);

CREATE INDEX idx_agents_agent_code ON agents(agent_code);
CREATE INDEX idx_agents_device_fingerprint ON agents(device_fingerprint_hash);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_province ON agents(province);

-- ============================================================
-- ACCOUNTS (Ledger heads — every wallet/float/commission/revenue head)
-- ============================================================
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_type    account_type NOT NULL,
    owner_customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    owner_agent_id  UUID REFERENCES agents(id) ON DELETE RESTRICT,
    currency        VARCHAR(3) NOT NULL DEFAULT 'PGK',
    balance         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Operational/customer/commission balances must never go negative.
    -- Internal clearing/revenue/tax accounts may technically run negative during reconciliation windows,
    -- so the non-negative constraint is scoped to customer-facing and agent operational accounts.
    CONSTRAINT chk_balance_non_negative CHECK (
        account_type NOT IN ('CUSTOMER_WALLET', 'AGENT_FLOAT', 'AGENT_COMMISSION', 'VOUCHER_HOLDING')
        OR balance >= 0
    ),
    CONSTRAINT chk_owner_exclusivity CHECK (
        (owner_customer_id IS NOT NULL AND owner_agent_id IS NULL)
        OR (owner_customer_id IS NULL AND owner_agent_id IS NOT NULL)
        OR (owner_customer_id IS NULL AND owner_agent_id IS NULL) -- platform-level accounts
    )
);

CREATE UNIQUE INDEX uq_accounts_customer_wallet ON accounts(owner_customer_id, account_type) WHERE owner_customer_id IS NOT NULL;
CREATE UNIQUE INDEX uq_accounts_agent_type ON accounts(owner_agent_id, account_type) WHERE owner_agent_id IS NOT NULL;
CREATE INDEX idx_accounts_owner_customer ON accounts(owner_customer_id);
CREATE INDEX idx_accounts_owner_agent ON accounts(owner_agent_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);

-- ============================================================
-- TRANSACTIONS (header) + ENTRIES (double-entry lines)
-- ============================================================
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type    transaction_type NOT NULL,
    status              transaction_status NOT NULL DEFAULT 'PENDING',
    amount              NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    fee_amount          NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    currency            VARCHAR(3) NOT NULL DEFAULT 'PGK',
    initiating_agent_id UUID REFERENCES agents(id),
    customer_id         UUID REFERENCES customers(id),
    idempotency_key     UUID NOT NULL UNIQUE,
    client_epoch_ms     BIGINT,
    description         TEXT,
    metadata            JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    posted_at           TIMESTAMPTZ
);

CREATE INDEX idx_transactions_idempotency ON transactions(idempotency_key);
CREATE INDEX idx_transactions_agent ON transactions(initiating_agent_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_type_status ON transactions(transaction_type, status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE TABLE transaction_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    direction       entry_direction NOT NULL,
    amount          NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    balance_after   NUMERIC(18,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entries_transaction ON transaction_entries(transaction_id);
CREATE INDEX idx_entries_account ON transaction_entries(account_id);
CREATE INDEX idx_entries_account_created ON transaction_entries(account_id, created_at);

-- ============================================================
-- VOUCHERS (Non-Customer Remittance)
-- ============================================================
CREATE TABLE vouchers (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issuing_transaction_id  UUID NOT NULL REFERENCES transactions(id),
    redeeming_transaction_id UUID REFERENCES transactions(id),
    sender_account_id       UUID NOT NULL REFERENCES accounts(id),
    recipient_mobile        VARCHAR(20) NOT NULL,
    amount                  NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    token_hash              VARCHAR(255) NOT NULL UNIQUE,
    token_salt              VARCHAR(255) NOT NULL,
    status                  voucher_status NOT NULL DEFAULT 'ACTIVE',
    redeemed_by_agent_id    UUID REFERENCES agents(id),
    redeemed_at             TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_voucher_redeemed_consistency CHECK (
        (status = 'REDEEMED' AND redeemed_at IS NOT NULL AND redeemed_by_agent_id IS NOT NULL AND redeeming_transaction_id IS NOT NULL)
        OR (status != 'REDEEMED')
    )
);

CREATE INDEX idx_vouchers_token_hash ON vouchers(token_hash);
CREATE INDEX idx_vouchers_recipient_mobile ON vouchers(recipient_mobile);
CREATE INDEX idx_vouchers_status_expires ON vouchers(status, expires_at);

-- ============================================================
-- PROFILE CHANGE LOG (Audit trail)
-- ============================================================
CREATE TABLE profile_change_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    changed_by_agent_id UUID NOT NULL REFERENCES agents(id),
    field_name      VARCHAR(100) NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    auth_method     VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_logs_customer ON profile_change_logs(customer_id);
CREATE INDEX idx_profile_logs_created ON profile_change_logs(created_at);

-- ============================================================
-- ENABLE pgcrypto for gen_random_uuid()
-- ============================================================