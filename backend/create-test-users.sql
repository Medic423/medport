-- Create test users with correct password hash
-- Password: testpassword, Hash: $2b$10$P3pfQ5KD9zSR4LPY2O99O.8BbK6zmeHpNNqPuYW/4/XR/.eRT0GxO

-- Insert healthcare user
INSERT INTO healthcare_users (email, password, name, facility_name, facility_type) VALUES 
('test@hospital.com', '$2b$10$P3pfQ5KD9zSR4LPY2O99O.8BbK6zmeHpNNqPuYW/4/XR/.eRT0GxO', 'Test Healthcare User', 'Test Hospital', 'HOSPITAL')
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  facility_name = EXCLUDED.facility_name,
  facility_type = EXCLUDED.facility_type;

-- Insert EMS user
INSERT INTO ems_users (email, password, name, agency_name, agency_type) VALUES 
('test@ems.com', '$2b$10$P3pfQ5KD9zSR4LPY2O99O.8BbK6zmeHpNNqPuYW/4/XR/.eRT0GxO', 'Test EMS User', 'Test EMS Agency', 'AMBULANCE')
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  agency_name = EXCLUDED.agency_name,
  agency_type = EXCLUDED.agency_type;
