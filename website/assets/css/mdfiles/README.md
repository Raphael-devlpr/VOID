# VOID Tech Solutions

Official website repository for VOID Tech Solutions - Professional web development, mobile apps, and IT services in South Africa.

## Deployment

This site is deployed from this Git repository to the server via cPanel’s **Git™ Version Control** feature.

### How it works

- **Remote repository**: `https://github.com/Raphael-devlpr/VOID.git`
- **Branch used for production**: `main`
- **Server repo path in cPanel**: `/home/voidtech/repositories/VOID`

When you deploy, cPanel does a `git pull` into the server repo, which updates all tracked files in that repo to match the latest commit on `main`. If that repo is your document root (or is the folder your site is served from), then the live site is updated automatically.

### Deploy steps (from local machine)

1. Make changes locally in your VOID project.
2. Commit and push to GitHub:
	- `git add .`
	- `git commit -m "Your message"`
	- `git push origin main`
3. Log into **cPanel → Git™ Version Control → Manage** for the `VOID` repository.
4. Click **Pull or Deploy** (or the equivalent button on that page).

After step 4, the server repo at `/home/voidtech/repositories/VOID` is updated to the latest commit, and your site files on cPanel reflect that commit.

## Tech Stack
- HTML5, CSS3, JavaScript
- Bootstrap
- Swiper.js
- GSAP animations

## SEO Optimized
Includes comprehensive SEO meta tags, schema markup, and Google Analytics integration.
