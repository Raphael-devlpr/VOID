# Client Portal Setup Guide

## Overview
The VOID Client Portal allows your clients to login and track their project progress, view status updates, and communicate with your team through notes.

## Features
- ✅ Secure client authentication with bcrypt passwords
- ✅ View all assigned projects
- ✅ Track project status and history
- ✅ Add notes and feedback
- ✅ Mobile responsive design
- ✅ Link to main website

## Setup Instructions

### 1. Run the Database Setup

1. Open Supabase SQL Editor
2. Run the SQL from `client-portal-setup.sql`
3. This creates:
   - `clients` table (client authentication)
   - `client_notes` table (client feedback)
   - Adds `client_id` column to `projects` table

### 2. Create Client Accounts

#### Method 1: Generate Password Hash (Recommended)
```bash
node generate-client-hash.js "ClientPass123"
```

This will output:
- Password hash
- SQL INSERT statement
- SQL UPDATE statement

#### Method 2: Use Supabase Dashboard
1. Go to Supabase → Table Editor → `clients`
2. Insert new row:
   - email: `client@example.com`
   - password_hash: (use generated hash)
   - name: `John Doe`
   - company: `Acme Corp`
   - phone: `+1234567890`
   - is_active: `true`

### 3. Link Clients to Projects

When creating or editing a project in the admin dashboard, you need to link it to a client:

```sql
-- Get the client ID
SELECT id, name, email FROM clients WHERE email = 'client@example.com';

-- Update project to link with client
UPDATE projects 
SET client_id = 'your-client-uuid-here'
WHERE client_email = 'client@example.com';
```

Or via Supabase Dashboard:
1. Go to `projects` table
2. Edit the project row
3. Set `client_id` to the client's UUID

### 4. Test the Client Portal

1. Visit: `https://your-domain.vercel.app/client/login`
2. Login with client credentials
3. View projects and add notes

## Client Portal Routes

- `/client/login` - Client login page
- `/client/dashboard` - Client dashboard (shows all projects)
- `/client/projects/[id]` - Project details with notes

## Admin Workflow

### Adding a New Client:

1. **Generate Password:**
   ```bash
   node generate-client-hash.js "SecurePassword123"
   ```

2. **Create Client in Database:**
   - Copy the hash from step 1
   - Insert into `clients` table via Supabase

3. **Create Project:**
   - Create project in admin dashboard
   - Note the client's email

4. **Link Project to Client:**
   ```sql
   UPDATE projects 
   SET client_id = (SELECT id FROM clients WHERE email = 'client@example.com')
   WHERE client_email = 'client@example.com';
   ```

5. **Send Credentials to Client:**
   - Email: `client@example.com`
   - Password: `SecurePassword123`
   - Portal URL: `https://your-domain.vercel.app/client/login`

## Security Best Practices

1. ✅ Passwords are hashed with bcrypt (10 salt rounds)
2. ✅ Sessions stored in httpOnly cookies
3. ✅ Client can only view their own projects
4. ✅ Client cannot modify project details (read-only)
5. ✅ Clients can only add notes, not edit/delete them

## Example SQL Queries

### Create a client:
```sql
INSERT INTO clients (email, password_hash, name, company, is_active)
VALUES (
  'john@acmecorp.com',
  '$2b$10$wxPZeDpxjwwccwMpV3D9SuoFIkTkjUMFr.nNUa0hR.OrQKOxea9Sm',
  'John Doe',
  'Acme Corporation',
  true
);
```

### Link all projects for a client:
```sql
UPDATE projects 
SET client_id = (SELECT id FROM clients WHERE email = 'john@acmecorp.com')
WHERE client_email = 'john@acmecorp.com';
```

### View client's projects:
```sql
SELECT p.*, c.name as client_name
FROM projects p
JOIN clients c ON p.client_id = c.id
WHERE c.email = 'john@acmecorp.com';
```

### View client notes:
```sql
SELECT cn.*, p.project_name, c.name as client_name
FROM client_notes cn
JOIN projects p ON cn.project_id = p.id
JOIN clients c ON cn.client_id = c.id
WHERE c.email = 'john@acmecorp.com'
ORDER BY cn.created_at DESC;
```

## Troubleshooting

### Client can't see their projects:
- Verify `client_id` is set on the project
- Check client's `is_active` is `true`
- Confirm `client_email` matches the client's email

### Login fails:
- Verify password hash is correct
- Check client exists and `is_active` is `true`
- Look at browser console for errors

### Notes not saving:
- Ensure client is logged in
- Check project belongs to the client
- Verify `client_notes` table exists

## Future Enhancements

Possible additions:
- File uploads for clients
- Email notifications when status changes
- Client profile management
- Download project documents
- Live chat with admin
- Project milestones and deliverables

## Support

For issues or questions, contact the development team.
