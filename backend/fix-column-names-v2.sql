-- Fix column names to match Prisma schema (only existing columns)

-- Fix healthcare_users table
ALTER TABLE healthcare_users RENAME COLUMN facility_name TO "facilityName";
ALTER TABLE healthcare_users RENAME COLUMN facility_type TO "facilityType";
ALTER TABLE healthcare_users RENAME COLUMN user_type TO "userType";
ALTER TABLE healthcare_users RENAME COLUMN is_active TO "isActive";
ALTER TABLE healthcare_users RENAME COLUMN created_at TO "createdAt";
ALTER TABLE healthcare_users RENAME COLUMN updated_at TO "updatedAt";

-- Fix ems_users table  
ALTER TABLE ems_users RENAME COLUMN agency_name TO "agencyName";
ALTER TABLE ems_users RENAME COLUMN agency_type TO "agencyType";
ALTER TABLE ems_users RENAME COLUMN user_type TO "userType";
ALTER TABLE ems_users RENAME COLUMN is_active TO "isActive";
ALTER TABLE ems_users RENAME COLUMN created_at TO "createdAt";
ALTER TABLE ems_users RENAME COLUMN updated_at TO "updatedAt";
