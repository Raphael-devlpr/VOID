# VOID Admin Dashboard - Deployment Guide

## 🚀 Deploy to Vercel (Free & Easy)

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```powershell
   cd C:\Users\rmunaki\Desktop\Websites\VOID\admin
   git init
   git add .
   git commit -m "Initial commit - VOID Admin Dashboard"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name: `void-admin-dashboard`
   - Make it **Private** (recommended for admin panels)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. **Push your code:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/void-admin-dashboard.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to https://vercel.com**
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import** your `void-admin-dashboard` repository
5. **Configure:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

6. **Add Environment Variables** (IMPORTANT!):
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://zsbmowhmlylwrfdbtqqc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_z3sJdiAqnTHW8NnrCczx1A_XXutYuAL
   ADMIN_EMAIL = admin@voidtechsolutions.co.za
   ```

7. **Click "Deploy"**

### Step 3: Access Your Live Site

- After ~2 minutes, you'll get a URL like: `https://void-admin-dashboard.vercel.app`
- Open it on any device (phone, tablet, computer)
- Login with: `admin@voidtechsolutions.co.za` / `Admin123!`

---

## 📱 Access on Phone

Once deployed:
1. Open your browser on your phone
2. Go to your Vercel URL
3. Bookmark it for easy access
4. Login works exactly the same!

---

## 🔄 Update Your Live Site

Whenever you make changes:
```powershell
git add .
git commit -m "Your changes"
git push
```
Vercel will **automatically redeploy** in ~2 minutes!

---

## 🔒 Security Tips

1. **Change the default password** after first login
2. Keep your `.env.local` file private (never commit it)
3. Use strong passwords
4. Consider adding 2FA in production

---

## 💡 Alternative: Expose Locally (Quick Test)

If you just want to test on your phone without deploying:

1. **Find your local IP:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Update next.config.ts** to allow external access:
   ```powershell
   npm run dev -- -H 0.0.0.0
   ```

3. **Access on phone** (same WiFi network):
   ```
   http://192.168.1.100:3000
   ```

⚠️ This is temporary and only works while dev server is running!

---

## 🆘 Troubleshooting

**Build fails on Vercel?**
- Check that all dependencies are in `package.json`
- Make sure environment variables are set correctly

**Can't access on phone?**
- Check you're on the same WiFi network
- Disable Windows Firewall temporarily for testing

**Need custom domain?**
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add your custom domain (e.g., admin.voidtechsolutions.co.za)
