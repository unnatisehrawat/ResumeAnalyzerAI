# Railway Deployment Guide

## Why the Crash Happened

Your Railway deployment crashed **today** (after working for a week) likely due to one or more of these reasons:

### 1. **Increased Traffic/Usage**
- The PDF parsing warnings were always present but accumulated over time
- More users → more PDF uploads → more warnings → memory exhaustion → SIGTERM

### 2. **Railway Platform Updates**
- Railway may have updated their health check requirements
- Stricter timeout policies for startup commands
- Changes to default memory limits

### 3. **Database Migration Timeout**
- The `prisma migrate deploy` command in your start script may have taken longer than usual
- Railway has strict startup timeouts (typically 5-10 minutes)
- If migrations timeout, Railway sends SIGTERM

### 4. **Accumulated Log Overhead**
- The `standardFontDataUrl` warnings were flooding logs
- Each PDF upload generated 3-4 warnings
- Over a week, this could cause memory/disk issues

## Fixes Implemented

✅ **PDF Parser Configuration** - Suppressed font warnings  
✅ **Health Check Endpoint** - Added `/health` for Railway monitoring  
✅ **Graceful Shutdown** - Proper SIGTERM handling  
✅ **Railway Config** - Created `railway.json` with optimal settings

## Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Fix Railway deployment crash - add health checks and optimize PDF parsing"
git push origin main
```

### 2. Railway Environment Variables
Ensure these are set in your Railway project:
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Railway)
- `JWT_SECRET` - Your JWT secret key
- `GROQ_API_KEY` - Your Groq API key
- `PORT` - Auto-set by Railway (don't override)

### 3. Monitor Deployment
After pushing, watch Railway logs for:
- ✅ `Server running on :XXXX`
- ✅ `Health check available at...`
- ❌ No `standardFontDataUrl` warnings
- ❌ No SIGTERM signals

## Known Limitations

### ⚠️ Ephemeral File Storage
**Issue**: Uploaded PDFs are stored in `/uploads` directory, which is **ephemeral** on Railway.

**Impact**: 
- Files are deleted when the container restarts
- Files are NOT persisted between deployments

**Current Behavior**: 
- PDFs are only needed during analysis (temporary)
- After analysis completes, the file is no longer needed
- This is acceptable for your current use case

**Future Enhancement** (if needed):
- Integrate cloud storage (AWS S3, Cloudinary, etc.)
- Store file URLs in database instead of local paths

## Troubleshooting

### If deployment still fails:

1. **Check Railway Logs**
   ```
   Railway Dashboard → Your Project → Deployments → View Logs
   ```

2. **Verify Health Check**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"healthy","timestamp":"..."}`

3. **Test Locally First**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Visit `http://localhost:5000/health`

4. **Database Connection**
   - Ensure PostgreSQL plugin is attached in Railway
   - Verify `DATABASE_URL` is set automatically

5. **Memory Issues**
   - Railway free tier: 512MB RAM
   - If still crashing, consider upgrading plan
   - Monitor memory usage in Railway metrics

## Contact Support

If issues persist after these fixes:
1. Check Railway status page: https://status.railway.app
2. Railway Discord: https://discord.gg/railway
3. Review Railway docs: https://docs.railway.app
