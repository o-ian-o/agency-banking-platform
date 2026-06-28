-- 1. Master Table for Payment Types
CREATE TABLE master_payment_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(10) UNIQUE NOT NULL,
    description VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Master Table for Beneficiary BICs (Child of Payment Types)
CREATE TABLE master_beneficiary_bics (
    id SERIAL PRIMARY KEY,
    bic_code VARCHAR(20) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    payment_type_id INT REFERENCES master_payment_types(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed Data (Generating IDs 1 through 4)
INSERT INTO master_payment_types (type_code, description) VALUES
('NEFT', 'National Electronic Funds Transfer'),
('RTGS', 'Real Time Gross Settlement'),
('IMPS', 'Immediate Payment Service'),
('SWIFT', 'International Wire');

-- Link BICs to specific Payment Types (e.g., SWIFT = ID 4, NEFT = ID 1)
INSERT INTO master_beneficiary_bics (bic_code, bank_name, country, payment_type_id) VALUES
('BSP-PG', 'Bank South Pacific', 'Papua New Guinea', 1),
('ANZ-PG', 'ANZ Bank', 'Papua New Guinea', 4),
('WBC-PG', 'Westpac', 'Papua New Guinea', 4),
('KINA-PG', 'Kina Bank', 'Papua New Guinea', 2);