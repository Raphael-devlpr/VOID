# Quick Start: Adding Your First Client

## Step 1: Run Database Setup

1. Open Supabase Dashboard: https://app.supabase.com/
2. Go to your project → SQL Editor
3. Copy and paste the entire contents of `client-portal-setup.sql`
4. Click "Run" to execute

## Step 2: Generate Client Password

Open terminal in the admin folder and run:

```bash
node generate-client-hash.js "ClientPassword123"
```

Copy the generated hash (starts with `$2b$10$...`)

## Step 3: Create Client Account

In Supabase SQL Editor, run:

```sql
INSERT INTO clients (email, password_hash, name, company, phone, is_active)
VALUES (
  'client@example.com',      -- Client's email
  'PASTE_HASH_HERE',          -- The hash from step 2
  'John Doe',                 -- Client's name
  'Acme Corporation',         -- Company name  
  '+27123456789',             -- Phone number
  true                        -- Active status
);
```

## Step 4: Link Existing Projects to Client

If you already have projects with this client's email:

```sql
-- First, get the client's ID
SELECT id, name, email FROM clients WHERE email = 'client@example.com';

-- Copy the ID, then update projects
UPDATE projects 
SET client_id = 'CLIENT_ID_FROM_ABOVE'
WHERE client_email = 'client@example.com';
```

## Step 5: Test the Client Portal

1. Visit: `https://your-domain.vercel.app/client/login`
2. Login with:
   - Email: `client@example.com`
   - Password: `ClientPassword123`
3. You should see the client dashboard with their projects!

## Step 6: Share with Client

Send your client:
- Portal URL: `https://your-domain.vercel.app/client/login`
- Email: `client@example.com`
- Password: `ClientPassword123`

## Future Clients

When creating new projects in admin:

1. Create client in database (steps 2-3)
2. When you create the project, note the client's email
3. After creating project, link it:
   ```sql
   UPDATE projects 
   SET client_id = (SELECT id FROM clients WHERE email = 'new-client@email.com')
   WHERE id = 'PROJECT_ID';
   ```

## Troubleshooting

**"Invalid credentials"**
- Verify email is lowercase
- Check password hash is complete (starts with `$2b$10$`)
- Confirm `is_active = true`

**"No projects"**
- Run: `SELECT * FROM projects WHERE client_id = 'CLIENT_ID';`
- If empty, link projects using UPDATE statement above

**"Project not found"**
- Verify `client_id` matches the logged-in client
- Check project exists in database

## Admin Access vs Client Access

**Admin Portal** (you)
- URL: `/login`
- Can see all projects
- Can create/edit/delete projects
- Can manage clients
- Full access

**Client Portal** (your clients)
- URL: `/client/login`
- Can only see their own projects
- Can view project status
- Can add notes/feedback
- Read-only access to project details

---

For detailed documentation, see `CLIENT-PORTAL-GUIDE.md`
