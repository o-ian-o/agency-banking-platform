-- Platform-level accounts (no owner)
INSERT INTO accounts (id, account_type, currency, balance)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'PLATFORM_REVENUE', 'PGK', 0.00),
    ('00000000-0000-0000-0000-000000000002', 'TAX_LIABILITY', 'PGK', 0.00);

-- Sample agent
INSERT INTO agents (id, agent_code, full_name, primary_mobile, status, device_fingerprint_hash, province, district, llg, village_or_location, daily_cashout_limit)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'AGT-PORTMORESBY-001', 'John Kaupa', '+67571234567', 'ACTIVE', 'devicehash-sample-001', 'National Capital District', 'Port Moresby', 'Moresby North-West', 'Gerehu', 10000.00);

-- Agent's float and commission accounts
INSERT INTO accounts (account_type, owner_agent_id, currency, balance)
VALUES
    ('AGENT_FLOAT', '11111111-1111-1111-1111-111111111111', 'PGK', 5000.00),
    ('AGENT_COMMISSION', '11111111-1111-1111-1111-111111111111', 'PGK', 0.00);

-- Sample customer
INSERT INTO customers (id, full_name, date_of_birth, primary_mobile, kyc_tier, province, district, llg, village, phone_verified)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Maria Soroi', '1995-04-12', '+67572345678', 'TIER_1_BASIC', 'Eastern Highlands', 'Goroka', 'Goroka Urban', 'Kamaliki', TRUE);

-- Customer wallet account
INSERT INTO accounts (account_type, owner_customer_id, currency, balance)
VALUES
    ('CUSTOMER_WALLET', '22222222-2222-2222-2222-222222222222', 'PGK', 100.00);