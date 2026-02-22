# Render + Supabase Deployment Guide

## Overview

- **Backend**: [Render](https://render.com) (free tier Web Service)
- **Database**: [Supabase](https://supabase.com) (free tier PostgreSQL)
- **Frontend**: Vercel (unchanged)

---

## Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g., `resume-analyzer`), set a strong **DB password**, pick a region
3. Wait for the project to finish provisioning (~1 min)
4. Go to **Project Settings → Database → Connection string → URI**
5. Copy the URI — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual Supabase DB password

> ⚠️ **Important**: Supabase free tier uses **port 5432** (direct) or **port 6543** (pooler). Use the **direct connection** URL (port 5432) for Prisma migrations to work correctly. The pooler (port 6543) can cause issues with `prisma migrate deploy`.

---

## Step 2: Deploy Backend to Render

### 2a. Create a Render Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo (`resume-analyzerAI`)
3. Set the **Root Directory** to `backend`
4. Render will auto-detect Node.js. Set:
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && node server.js`
5. Choose the **Free** plan

### 2b. Set Environment Variables in Render

Go to **Environment → Add Environment Variable** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | `secret_12345_key` (or a new strong secret) |
| `GROQ_API_KEY` | `gsk_j9FoKgDwq...` (your Groq key) |
| `NODE_ENV` | `production` |

> ✅ The `PORT` env var is **automatically set** by Render — don't add it manually.

### 2c. Deploy

Click **Create Web Service** — Render will build and deploy automatically.

Watch the logs for:
- ✅ `Prisma: Applied X migration(s)` 
- ✅ `Server running on :PORT`
- ✅ `Server ready to accept requests`

Your backend URL will be something like:
```
https://resume-analyzer-backend.onrender.com
```

Test the health check:
```
https://resume-analyzer-backend.onrender.com/health
```
Should return: `{"status":"healthy","timestamp":"..."}`

---

## Step 3: Update Frontend

### 3a. Update Local `.env`

In `frontend/.env`:
```
VITE_API_BASE_URL=https://resume-analyzer-backend.onrender.com
```

### 3b. Update Vercel Environment Variable

1. Go to your Vercel project → **Settings → Environment Variables**
2. Update `VITE_API_BASE_URL` to your new Render backend URL
3. **Redeploy** the frontend on Vercel

### 3c. Update Backend CORS (if needed)

Your `backend/app.js` already allows your Vercel frontend URL. No changes needed unless your Vercel URL changed.

---

## Step 4: Update Local Development `.env`

In `backend/.env`, update these lines for local dev:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"
JWT_SECRET="secret_12345_key"
GROQ_API_KEY="gsk_..."
```

You can keep `DATABASE_URL_LOCAL` pointing to your local PostgreSQL if you use it locally.

---

## Troubleshooting

### Prisma Migration Error on Render
- Check that `DATABASE_URL` is the **direct** Supabase URL (port 5432, not 6543)
- Make sure `[YOUR-PASSWORD]` is replaced with the actual password

### CORS Error in Browser
- Verify `VITE_API_BASE_URL` in Vercel env vars points to the Render URL
- Check that Render URL is listed in `backend/app.js` CORS `origin` array

### Render Service Sleeps (Free Tier)
- Free tier Render services sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds (cold start)
- This is normal for free tier — upgrade to a paid plan to avoid it

### Check Render Logs
```
Render Dashboard → Your Service → Logs
```
