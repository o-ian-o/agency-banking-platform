-- Create Group Master Table
CREATE TABLE user_groups (
    group_id VARCHAR(50) PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create User Table
CREATE TABLE app_users (
    user_id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    email VARCHAR(100),
    group_id VARCHAR(50) REFERENCES user_groups(group_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Groups
INSERT INTO user_groups (group_id, group_name, description) VALUES 
('GRP_SUPERUSER', 'SUPERUSER', 'Complete system access'),
('GRP_MAKER', 'MAKER', 'Initiates transactions'),
('GRP_CHECKER', 'CHECKER', 'Authorizes transactions');

-- Seed Default Users (Passwords are plain text "password123" hashed with BCrypt)
INSERT INTO app_users (user_id, user_name, password_hash, email, group_id) VALUES 
('SUP-00001', 'System Administrator', '$2a$10$c1x.hX/.4YF2jL5QG0Wz.O0e/eD9d/mI.z1K/0hD0c1x.hX/.4YF2', 'admin@agency.com', 'GRP_SUPERUSER'),
('MKR-00001', 'Jane Maker', '$2a$10$c1x.hX/.4YF2jL5QG0Wz.O0e/eD9d/mI.z1K/0hD0c1x.hX/.4YF2', 'maker@agency.com', 'GRP_MAKER'),
('CHK-00001', 'John Checker', '$2a$10$c1x.hX/.4YF2jL5QG0Wz.O0e/eD9d/mI.z1K/0hD0c1x.hX/.4YF2', 'checker@agency.com', 'GRP_CHECKER');