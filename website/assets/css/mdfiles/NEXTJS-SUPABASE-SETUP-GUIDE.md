# VOID Admin Dashboard - Next.js + Supabase Setup Guide

## 🎯 What We're Building
A modern, scalable admin dashboard with:
- Admin authentication
- Project management with real-time updates
- Client portal for status tracking
- Email notifications
- PIN management for software downloads

## 📚 Step-by-Step Setup

### STEP 1: Prerequisites (5 minutes)
Install these if you don't have them:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **Git** (for version control)
   - Download: https://git-scm.com/
   - Check version: `git --version`

3. **VS Code** (recommended editor)
   - Download: https://code.visualstudio.com/

4. **Create accounts:**
   - GitHub account: https://github.com/signup
   - Supabase account: https://supabase.com (sign up with GitHub)
   - Vercel account: https://vercel.com (sign up with GitHub)

---

### STEP 2: Create Next.js Project (5 minutes)

Open PowerShell/Terminal and run:

```powershell
# Navigate to your projects folder
cd C:\Users\rmunaki\Desktop\Websites

# Create new Next.js project
npx create-next-app@latest void-admin-dashboard

# You'll be asked questions - answer like this:
# ✔ Would you like to use TypeScript? … Yes
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Tailwind CSS? … Yes
# ✔ Would you like to use `src/` directory? … Yes
# ✔ Would you like to use App Router? … Yes
# ✔ Would you like to customize the default import alias (@/*)? … No

# Navigate into project
cd void-admin-dashboard

# Open in VS Code
code .
```

---

### STEP 3: Set Up Supabase (10 minutes)

#### 3.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name:** void-admin
   - **Database Password:** (create strong password - SAVE THIS!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free
4. Click "Create new project" (takes ~2 minutes)

#### 3.2 Get Your Supabase Credentials
1. Once project is ready, go to **Settings** (gear icon) → **API**
2. Copy these values (we'll use them soon):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public** key (starts with `eyJ...`)

#### 3.3 Create Database Tables
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create admins table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project status history table
CREATE TABLE project_status_history (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create software PINs table
CREATE TABLE software_pins (
  id SERIAL PRIMARY KEY,
  pin TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_ip TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_pins ENABLE ROW LEVEL SECURITY;

-- Create policies for projects (allow all operations for now - we'll secure later)
CREATE POLICY "Enable all access for projects" ON projects FOR ALL USING (true);
CREATE POLICY "Enable all access for history" ON project_status_history FOR ALL USING (true);
CREATE POLICY "Enable all access for pins" ON software_pins FOR ALL USING (true);

-- Insert default admin (password: Admin123! - CHANGE THIS LATER)
-- Password hash is bcrypt of "Admin123!"
INSERT INTO admins (email, password_hash, name) 
VALUES (
  'admin@voidtechsolutions.co.za',
  '$2a$10$rKx8YGHWnrQYF1KY1P5y.OGxVFQKjZp8F8VXzPvEX8ypWjJJEKZAi',
  'VOID Admin'
);
```

4. Click **Run** (bottom right)
5. You should see "Success. No rows returned"

---

### STEP 4: Install Dependencies (2 minutes)

In your terminal (in the project folder):

```powershell
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install bcryptjs
npm install @types/bcryptjs --save-dev
npm install lucide-react  # Icon library
npm install react-hot-toast  # Notifications
npm install date-fns  # Date formatting
npm install resend  # Email service (we'll set up later)
```

---

### STEP 5: Configure Environment Variables (2 minutes)

1. In your project root, create a file called `.env.local`
2. Add this content (replace with your actual values from Step 3.2):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Admin Email (for notifications)
ADMIN_EMAIL=admin@voidtechsolutions.co.za

# Resend API Key (we'll add this later)
RESEND_API_KEY=
```

3. Save the file

**Important:** Never commit `.env.local` to Git! It's already in `.gitignore` by default.

---

### STEP 6: Project Structure

Your project structure will look like this:

```
void-admin-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Admin dashboard
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Project list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Edit project
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      # New project
│   │   │   └── pins/
│   │   │       └── page.tsx          # PIN manager
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts          # Projects API
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # Single project API
│   │   │   ├── pins/
│   │   │   │   └── route.ts          # PINs API
│   │   │   └── auth/
│   │   │       └── route.ts          # Auth API
│   │   ├── client-portal/
│   │   │   └── page.tsx              # Client portal
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page (redirect)
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── ProjectCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       └── index.ts                  # TypeScript types
├── .env.local                        # Environment variables (DO NOT COMMIT)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✅ Checkpoint

At this point, you should have:
- ✅ Next.js project created
- ✅ Supabase project created
- ✅ Database tables created
- ✅ Dependencies installed
- ✅ Environment variables configured

---

## 🎯 Next Steps

Now we'll build the actual application:
1. Create Supabase client utilities
2. Build authentication
3. Create admin dashboard
4. Build project management pages
5. Create client portal
6. Set up email notifications
7. Deploy to Vercel

Are you ready to continue? Let me know when you've completed Steps 1-6!

---

## 🆘 Troubleshooting

**Problem:** `npm install` fails
- **Solution:** Make sure Node.js v18+ is installed: `node --version`

**Problem:** Can't create Supabase project
- **Solution:** Check if you've verified your email address

**Problem:** SQL queries fail
- **Solution:** Make sure you're in the SQL Editor, not the Table Editor

**Problem:** `.env.local` not working
- **Solution:** Restart your dev server: `npm run dev`

---

## 📞 Need Help?

If you get stuck on any step, let me know:
- Which step you're on
- What error you're seeing
- Screenshot if helpful

Let's build this together! 🚀
