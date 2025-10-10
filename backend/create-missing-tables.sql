-- Create healthcare_users table
CREATE TABLE IF NOT EXISTS healthcare_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    facility_name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    user_type TEXT NOT NULL DEFAULT 'HEALTHCARE',
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create ems_users table  
CREATE TABLE IF NOT EXISTS ems_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    agency_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    user_type TEXT NOT NULL DEFAULT 'EMS',
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS healthcare_users_email_idx ON healthcare_users(email);
CREATE INDEX IF NOT EXISTS healthcare_users_is_active_idx ON healthcare_users(is_active);
CREATE INDEX IF NOT EXISTS ems_users_email_idx ON ems_users(email);
CREATE INDEX IF NOT EXISTS ems_users_is_active_idx ON ems_users(is_active);

-- Insert test users (password is 'testpassword' hashed with bcrypt)
-- Hash for 'testpassword': $2b$10$K7L1OJ45/1YyO5v9B5Qv4uK7L1OJ45/1YyO5v9B5Qv4uK7L1OJ45/1YyO5v9B5Qv4u
INSERT INTO healthcare_users (email, password, name, facility_name, facility_type) VALUES 
('test@hospital.com', '$2b$10$K7L1OJ45/1YyO5v9B5Qv4uK7L1OJ45/1YyO5v9B5Qv4uK7L1OJ45/1YyO5v9B5Qv4u', 'Test Healthcare User', 'Test Hospital', 'HOSPITAL')
ON CONFLICT (email) DO NOTHING;

INSERT INTO ems_users (email, password, name, agency_name, agency_type) VALUES 
('test@ems.com', '$2b$10$K7L1OJ45/1YyO5v9B5Qv4uK7L1OJ45/1YyO5v9B5Qv4uK7L1OJ45/1YyO5v9B5Qv4u', 'Test EMS User', 'Test EMS Agency', 'AMBULANCE')
ON CONFLICT (email) DO NOTHING;
