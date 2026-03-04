-- First, let's check if the admin exists
SELECT * FROM admins WHERE email = 'admin@voidtechsolutions.co.za';

-- If the admin doesn't exist or you want to recreate it, run this:
-- Delete existing admin (if any)
DELETE FROM admins WHERE email = 'admin@voidtechsolutions.co.za';

-- Insert fresh admin user
-- Email: admin@voidtechsolutions.co.za
-- Password: Admin123!
INSERT INTO admins (email, password_hash, name) 
VALUES (
  'admin@voidtechsolutions.co.za',
  '$2a$10$rKx8YGHWnrQYF1KY1P5y.OGxVFQKjZp8F8VXzPvEX8ypWjJJEKZAi',
  'VOID Admin'
);

-- Verify it was created
SELECT id, email, name, created_at FROM admins WHERE email = 'admin@voidtechsolutions.co.za';




