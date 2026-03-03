# VOID Admin Dashboard - Setup Instructions

## 🎉 Your Admin Dashboard is Ready!

All the code has been created! Now you just need to configure it with your Supabase credentials.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Set up Environment Variables

1. Copy the example file:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API
   - Copy the **Project URL** and **anon/public key**
   - Paste them into `.env.local`

### Step 2: Install Dependencies (if not already done)

```powershell
npm install
```

### Step 3: Start the Development Server

```powershell
npm run dev
```

### Step 4: Access Your Dashboard

Open your browser to: http://localhost:3000

**Default Login:**
- Email: `admin@voidtechsolutions.co.za`
- Password: `Admin123!`

---

## 🏗️ What's Included

### Pages Created:
- ✅ **Login Page** (`/login`) - Admin authentication
- ✅ **Dashboard** (`/dashboard`) - Overview with stats
- ✅ **Projects** (`/projects`) - List all projects
- ✅ **New Project** (`/projects/new`) - Create new project
- ✅ **Edit Project** (`/projects/[id]`) - Edit existing project
- ✅ **PIN Manager** (`/pins`) - Generate and manage software PINs
- ✅ **Client Portal** (`/client-portal`) - Public page for clients to track projects

### API Routes:
- ✅ `/api/auth/login` - Login endpoint
- ✅ `/api/auth/logout` - Logout endpoint
- ✅ `/api/projects` - Get all projects, create project
- ✅ `/api/projects/[id]` - Get, update, delete single project
- ✅ `/api/pins` - Get all PINs, generate new PINs
- ✅ `/api/client-portal` - Client portal data

### Components:
- ✅ Reusable UI components (Button, Card, Input, Badge, etc.)
- ✅ Navigation bar with authentication
- ✅ Toast notifications
- ✅ Type-safe with TypeScript

---

## 🔑 Supabase Tables

Make sure you've created these tables in Supabase (as per your setup guide):

1. **admins** - Store admin users
2. **projects** - Store client projects
3. **project_status_history** - Track project status changes
4. **software_pins** - Store software activation PINs

If you haven't created them yet, run the SQL from your `NEXTJS-SUPABASE-SETUP-GUIDE.md` file.

---

## 🚀 Using Your Dashboard

### Admin Workflow:
1. Login at `/login`
2. View dashboard stats at `/dashboard`
3. Create new projects at `/projects/new`
4. Manage projects at `/projects`
5. Generate PINs at `/pins`

### Client Workflow:
1. Clients visit `/client-portal`
2. Enter their email and project ID
3. View project status and timeline

---

## 📁 Project Structure

```
admin/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── projects/     # Projects CRUD
│   │   ├── pins/         # PIN management
│   │   └── client-portal/
│   ├── dashboard/        # Admin dashboard
│   ├── login/            # Login page
│   ├── projects/         # Projects pages
│   ├── pins/             # PIN manager
│   └── client-portal/    # Public client portal
├── components/
│   ├── ui/               # Reusable UI components
│   └── Navbar.tsx        # Navigation
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── .env.local            # Environment variables (create this!)
```

---

## 🔧 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists
- Check that variables are named correctly
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Invalid API key" or "Unauthorized"
- Verify your Supabase credentials in `.env.local`
- Make sure you're using the **anon/public** key, not the service key

### "Login failed"
- Make sure you've run the SQL to insert the default admin user
- Password should be: `Admin123!`
- Email: `admin@voidtechsolutions.co.za`

### Port 3000 is already in use
```powershell
# Kill the process or run on different port
npm run dev -- --port 3001
```

---

##  Next Steps

1. **Test everything:**
   - Login as admin
   - Create a test project
   - Generate some PINs
   - Test client portal with project ID and email

2. **Customize:**
   - Update company name in client portal
   - Change default admin credentials
   - Add your branding/colors

3. **Deploy:** (when ready)
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables in Vercel
   - Deploy!

---

## 🆘 Need Help?

Check these docs:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**Built with:**
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Supabase
- Hot Toast notifications
- Lucide Icons
