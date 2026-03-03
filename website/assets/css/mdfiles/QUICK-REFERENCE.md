# Quick Reference: Next.js + Supabase Commands

## 🚀 Getting Started Commands

```powershell
# Create Next.js project
npx create-next-app@latest void-admin-dashboard

# Navigate to project
cd void-admin-dashboard

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs bcryptjs lucide-react react-hot-toast date-fns resend
npm install @types/bcryptjs --save-dev

# Start development server
npm run dev

# Open in browser
# http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Important Files

- `.env.local` - Your secret keys (NEVER commit this!)
- `src/lib/supabase.ts` - Supabase connection
- `src/app/api/` - Backend API routes
- `src/app/(dashboard)/` - Admin pages
- `src/app/client-portal/` - Client-facing page

## 🔑 Default Login Credentials

**Email:** admin@voidtechsolutions.co.za  
**Password:** Admin123!  

⚠️ **Change this after first login!**

## 📊 Supabase Dashboard URLs

- **Your Project:** https://supabase.com/dashboard/project/your-project-id
- **Table Editor:** https://supabase.com/dashboard/project/your-project-id/editor
- **SQL Editor:** https://supabase.com/dashboard/project/your-project-id/sql
- **API Docs:** https://supabase.com/dashboard/project/your-project-id/api

## 🛠️ Development Workflow

1. Make changes to code
2. Save file (auto-reloads in browser)
3. Test in browser
4. Commit to Git
5. Push to GitHub
6. Auto-deploys to Vercel

## 📦 Tech Stack

- **Frontend:** Next.js 14 + React + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Email:** Resend
- **Hosting:** Vercel (free)
- **Icons:** Lucide React

## 🔗 Useful Links

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Tailwind Docs: https://tailwindcss.com/docs
- TypeScript Docs: https://www.typescriptlang.org/docs

## 💡 Pro Tips

1. Keep your `.env.local` file secret
2. Use `console.log()` for debugging
3. Check browser console for errors (F12)
4. Supabase has great error messages - read them!
5. Save your work frequently
6. Commit to Git regularly

## 🆘 Common Errors & Fixes

**Error:** "Cannot find module '@supabase/supabase-js'"
```powershell
npm install @supabase/supabase-js
```

**Error:** "Invalid API key"
- Check your `.env.local` file
- Make sure keys are correct
- Restart dev server: `npm run dev`

**Error:** Port 3000 already in use
```powershell
# Kill the process or use different port
npm run dev -- -p 3001
```

**Error:** Build fails
```powershell
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 🎯 Project Structure Cheat Sheet

```
src/app/
├── (auth)/          # Login/register pages
├── (dashboard)/     # Protected admin pages
├── api/            # Backend API endpoints
├── client-portal/  # Public client page
└── layout.tsx      # Root layout
```

## 📝 Git Commands

```powershell
# First time setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/void-admin.git
git push -u origin main

# Regular workflow
git add .
git commit -m "Add feature description"
git push
```

## 🚀 Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Database tables created in Supabase
- [ ] Default admin account created
- [ ] Email service configured (Resend)
- [ ] Test login works
- [ ] Test project creation
- [ ] Test client portal
- [ ] Change default admin password

---

Keep this file handy while developing! 📌
