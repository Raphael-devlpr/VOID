-- Fix the admin password hash
-- This will update the existing admin to use the correct bcrypt hash for 'Admin123!'

UPDATE admins 
SET password_hash = '$2a$10$rKx8YGHWnrQYF1KY1P5y.OGxVFQKjZp8F8VXzPvEX8ypWjJJEKZAi'
WHERE email = 'admin@voidtechsolutions.co.za';

-- Verify it was updated
SELECT id, email, name, password_hash FROM admins WHERE email = 'admin@voidtechsolutions.co.za';
