# cPanel File Storage Setup Guide

## ✅ Switched to cPanel Hosting Storage

You're now using your **voidtechsolutions.co.za** cPanel hosting (15GB) instead of Supabase Storage.

---

## 📁 What's Been Created

### 1. **PHP Upload Script**
**Location:** `website/upload-file.php`

This script handles file uploads on your cPanel server.

### 2. **API Routes (Updated)**
- `POST /api/projects/[id]/files` - Admin uploads (invoices, docs)
- `POST /api/client-portal/projects/[id]/files` - Client uploads
- `GET /api/projects/[id]/files` - Get all project files
- `DELETE /api/files/[id]` - Delete file record (optional: physical file deletion)

### 3. **Database Tables**
- `project_meetings` - Meeting scheduling
- `project_files` - File metadata storage

---

## 🚀 Setup Steps

### Step 1: Upload PHP Script to cPanel

1. Log in to your **cPanel** at voidtechsolutions.co.za
2. Go to **File Manager**
3. Navigate to `public_html/`
4. Upload `upload-file.php` from your local `website/` folder
5. Set permissions to `644` (read/write for owner)

### Step 2: Create Project Files Directory

In cPanel File Manager, create this folder structure:
```
public_html/
  └── project-files/          ← Create this folder
      └── (files will be organized automatically)
```

Set folder permissions to `755`

### Step 3: Update the Upload Key

1. Open `upload-file.php` in cPanel File Manager
2. Find this line:
   ```php
   $expectedKey = 'YOUR_SECURE_UPLOAD_KEY_HERE';
   ```
3. Replace with a secure random string (e.g., `vT9mK2pL8nX4qR7wY3sF`)
4. Save the file

### Step 4: Add Upload Key to Your Admin .env.local

In `admin/.env.local`, add:
```
FILE_UPLOAD_KEY=vT9mK2pL8nX4qR7wY3sF
```
(Use the SAME key from Step 3)

### Step 5: Run SQL Migration

Run this in Supabase SQL Editor:
```sql
-- From create-meetings-files-tables.sql
```

---

## 📂 File Organization

Files are automatically organized:
```
public_html/project-files/
  ├── project-1/
  │   ├── invoices/          ← Admin invoices
  │   ├── documents/         ← Admin documentation
  │   └── client-uploads/    ← Client files
  ├── project-2/
  │   └── ...
```

Files are accessible at:
```
https://voidtechsolutions.co.za/project-files/project-1/invoices/1234567890-invoice.pdf
```

---

## 🔒 Security Features

✅ **Upload Key Authentication** - Prevents unauthorized uploads  
✅ **File Size Limit** - 50MB maximum per file  
✅ **Filename Sanitization** - Removes dangerous characters  
✅ **Project Access Control** - Clients can only upload to their projects  
✅ **Admin-Only Deletion** - Only admins can delete files  

---

## 💾 Storage Usage

- **Available:** 15GB (cPanel hosting)
- **Cost:** Already included in your hosting
- **Monitoring:** Check cPanel → Disk Usage

---

##File Management

### Admin Can Upload:
- Invoices (PDF, DOCX, Excel)
- Documentation (PDF, Word docs)
- Images, designs, etc.

### Clients Can Upload:
- Content files
- Images
- Design assets
- Any project files (up to 50MB each)

### File Access:
- Admin: Can see ALL files for any project
- Client: Can only see files for THEIR projects

---

## 🔧 Testing

1. Log in to admin panel
2. Go to a project
3. Try uploading an invoice
4. Check:
   - File appears in database
   - File accessible at the URL
   - Physical file exists in cPanel File Manager

---

## 📝 Next Steps

1. ✅ Run the SQL migration
2. ✅ Upload `upload-file.php` to cPanel
3. ✅ Create `project-files/` folder
4. ✅ Set the upload key
5. ⏳ Build UI for file uploads
6. ⏳ Test file uploads and downloads

---

## 🐛 Troubleshooting

**Upload fails:**
- Check upload key matches in both PHP and .env.local
- Verify `project-files/` folder exists with 755 permissions
- Check PHP file uploads are enabled in cPanel

**File not accessible:**
- Verify folder permissions (755)
- Check file permissions (644)
- Ensure path is correct in browser

**Out of space:**
- Monitor disk usage in cPanel
- Consider upgrading hosting plan if needed
- Archive/delete old project files

---

## 💡 Optional: Physical File Deletion

Currently, DELETE only removes the database record. To also delete the physical file from cPanel:

1. Create `delete-file.php` in cPanel
2. Add authentication with the same upload key
3. Accept file path and delete using PHP `unlink()`
4. Call this PHP script from the DELETE API route

For most cases, just removing the DB record is sufficient.
