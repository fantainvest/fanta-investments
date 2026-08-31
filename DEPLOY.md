# Fanta Investments — Deployment Guide

## Architecture
- **Frontend**: React + Vite → Deployed on Vercel
- **Backend**: Express + SQLite → Deployed on Railway
- **Database**: SQLite (file-based, persists on Railway)

## Prerequisites
1. [Vercel account](https://vercel.com) (free tier works)
2. [Railway account](https://railway.app) ($5 free credit/month)
3. [Git](https://git-scm.com) installed

## Step 1: Push to GitHub

```bash
cd "C:\Users\Admin\Documents\AI JOBS\.freebuff"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fanta-investments.git
git push -u origin main
```

## Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `fanta-investments` repo
4. Railway will detect the `server/` folder — set the **Root Directory** to `server`
5. Go to **Settings** → **Environment Variables** and add:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-change-this
   CORS_ORIGIN=*
   PORT=5000
   ```
6. Railway will auto-deploy. Note your backend URL (e.g., `https://fanta-investments.up.railway.app`)

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"** → Import your `fanta-investments` repo
3. Set **Root Directory** to `client`
4. Set **Framework Preset** to `Vite`
5. Go to **Settings** → **Environment Variables** and add:
   ```
   VITE_API_URL=https://your-railway-url.railway.app/api
   ```
   (Replace with your actual Railway URL from Step 2)
6. Click **Deploy**

## Step 4: Verify

1. Open your Vercel URL (e.g., `https://fanta-investments.vercel.app`)
2. Test login with demo credentials:
   - User: `demo@fanta.io` / `password123`
   - Admin: `admin@fanta.io` / `password123`
3. Test the full flow: deposit, invest, withdraw

## Demo Credentials
- **User**: demo@fanta.io / password123
- **Admin**: admin@fanta.io / password123

## Notes
- SQLite database persists on Railway between deploys
- Railway's free tier ($5/month) covers moderate traffic
- Vercel's free tier covers frontend hosting with unlimited bandwidth
- For production, set a strong `JWT_SECRET` and restrict `CORS_ORIGIN` to your Vercel domain
