-- Create test EMS agency
INSERT INTO "EMSAgency" (id, name, "contactName", phone, email, address, city, state, "zipCode", "serviceArea", "operatingHours", "isActive", "createdAt", "updatedAt") VALUES 
('test-agency-001', 'Test EMS Agency', 'Test EMS User', '555-0123', 'test@ems.com', '123 Test St', 'Test City', 'TS', '12345', ARRAY['Test City'], '{"monday":"24/7","tuesday":"24/7","wednesday":"24/7","thursday":"24/7","friday":"24/7","saturday":"24/7","sunday":"24/7"}', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update EMS user to link to agency
UPDATE ems_users SET "agencyId" = 'test-agency-001' WHERE email = 'test@ems.com';
