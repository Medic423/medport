
-- Import script for chuck@ferrellhospitals.com
-- Run this on the production database

-- Insert the healthcare user
INSERT INTO healthcare_users (
  id, email, password, name, "facilityName", "facilityType", 
  "userType", "isActive", "manageMultipleLocations", 
  "createdAt", "updatedAt"
) VALUES (
  'chuck_at_ferrellhospitals.com_prod', -- Generate new ID for production
  'chuck@ferrellhospitals.com',
  '$2a$10$OAxDXsfYaelrPDyV3qDvQ.Ke1xxyM2GXe2Nu20M8RxnqVGg75kTry', -- Keep the same hashed password
  'chuck@ferrellhospitals.com',
  'Ferrell Hospitals',
  'Hospital',
  'HEALTHCARE',
  true,
  true,
  '2025-10-08T18:24:56.140Z',
  '2025-10-08T18:24:56.140Z'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  "facilityName" = EXCLUDED."facilityName",
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "manageMultipleLocations" = EXCLUDED."manageMultipleLocations",
  "updatedAt" = EXCLUDED."updatedAt";

-- Get the user ID for location insertion
-- Note: You'll need to replace 'USER_ID_HERE' with the actual ID after inserting the user


-- Location 1: Penn Highlands Brookville
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_1_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Brookville',
  '100 Hospital Road',
  'Brookville',
  'PA',
  '15825',
  '(814) 849-1852',
  'Hospital',
  true,
  true,
  NULL,
  NULL,
  '2025-10-08T18:24:56.143Z',
  '2025-10-08T18:24:56.143Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 2: Penn Highlands DuBois
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_2_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands DuBois',
  '100 Hospital Avenue',
  'DuBois',
  'PA',
  '15801',
  '(814) 371-2200',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.146Z',
  '2025-10-08T18:24:56.146Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 3: Penn Highlands Mon Valley
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_3_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Mon Valley',
  '1163 Country Club Road',
  'Monongahela',
  'PA',
  '15063',
  '(724) 258-1000',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.146Z',
  '2025-10-08T18:24:56.146Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 4: Penn Highlands Clearfield
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_4_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Clearfield',
  '809 Turnpike Avenue',
  'Clearfield',
  'PA',
  '16830',
  '(814) 765-5300',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.147Z',
  '2025-10-08T18:24:56.147Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 5: Penn Highlands Elk
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_5_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Elk',
  '763 Johnsonburg Road',
  'St. Marys',
  'PA',
  '15857',
  '(814) 834-4200',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.147Z',
  '2025-10-08T18:24:56.147Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 6: Penn Highlands State College
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_6_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands State College',
  '239 Colonnade Boulevard',
  'State College',
  'PA',
  '16803',
  '(814) 231-7000',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.148Z',
  '2025-10-08T18:24:56.148Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 7: Penn Highlands Connellsville
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_7_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Connellsville',
  '401 East Murphy Avenue',
  'Connellsville',
  'PA',
  '15425',
  '(724) 628-1500',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.148Z',
  '2025-10-08T18:24:56.148Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 8: Penn Highlands Huntingdon
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_8_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Huntingdon',
  '1225 Warm Springs Avenue',
  'Huntingdon',
  'PA',
  '16652',
  '(814) 643-3300',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.149Z',
  '2025-10-08T18:24:56.149Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
-- Location 9: Penn Highlands Tyrone
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_chuck_at_ferrellhospitals.com_9_prod',
  (SELECT id FROM healthcare_users WHERE email = 'chuck@ferrellhospitals.com'),
  'Penn Highlands Tyrone',
  '187 Hospital Drive',
  'Tyrone',
  'PA',
  '16686',
  '(814) 684-1255',
  'Hospital',
  true,
  false,
  NULL,
  NULL,
  '2025-10-08T18:24:56.149Z',
  '2025-10-08T18:24:56.149Z'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";
