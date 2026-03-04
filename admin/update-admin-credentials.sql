-- Update admin credentials to username "Raphael" with password "11090"
-- Run this in Supabase SQL Editor

-- Check current admin
SELECT id, email, name, created_at FROM admins WHERE email = 'admin@voidtechsolutions.co.za';

-- Update admin name and password
UPDATE admins 
SET 
  name = 'Raphael',
  password_hash = '$2b$10$kqVHWnDt/a14s4t.BbI6b.2kYJxc1fxAWISfhhmiqzptqHc76aD1u'
WHERE email = 'admin@voidtechsolutions.co.za';

-- Verify the update
SELECT id, email, name, created_at FROM admins WHERE email = 'admin@voidtechsolutions.co.za';
