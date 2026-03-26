# Deployment Guide — JobSeeker Pro

## Architecture Overview

```
User → Vercel (Next.js) → Supabase (Postgres + Auth + Storage)
                        → Anthropic Claude API (AI analysis)
                        → RapidAPI JSearch (Job data)
```

---

## Step 1: Supabase Production Setup

### Create Production Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project** → choose a region close to your users (e.g., `us-east-1`)
3. Save the generated database password securely

### Run Database Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — this creates all 6 tables, indexes, RLS policies, and triggers

### Configure Storage
1. Go to **Storage** → **New Bucket**
2. Name: `resumes`
3. Public: **OFF**
4. File size limit: `10485760` (10MB)
5. Allowed MIME types:
   - `application/pdf`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `text/plain`

### Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** (enabled by default)
3. Enable **Google**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID (Web application)
   - Authorized redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID + Secret into Supabase Google provider settings
4. Go to **URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: add `https://your-app.vercel.app/api/auth/callback`

### Grab Your Keys
From **Settings** → **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 2: API Keys

### Anthropic (Claude API)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Fund your account — Claude Sonnet costs ~$3/1M input tokens
4. Estimated cost: ~$0.01–0.05 per resume analysis

### RapidAPI (JSearch)
1. Sign up at [rapidapi.com](https://rapidapi.com)
2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
3. Free tier: 500 requests/month (enough for MVP testing)
4. Copy your RapidAPI key

---

## Step 3: Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Push your code to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Next.js — no build config changes needed
5. Add environment variables (see below)
6. Click **Deploy**

### Option B: Via CLI
```bash
npm i -g vercel
cd jobseeker-app
vercel login
vercel
# Follow prompts — select your team, link to project
# For production: vercel --prod
```

### Environment Variables in Vercel
Go to **Project Settings** → **Environment Variables** and add:

| Variable                          | Environment     | Value                    |
|-----------------------------------|-----------------|--------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | All             | `https://xxx.supabase.co`|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | All             | Supabase anon key        |
| `SUPABASE_SERVICE_ROLE_KEY`       | Production only | Supabase service role    |
| `ANTHROPIC_API_KEY`               | Production only | `sk-ant-...`             |
| `RAPIDAPI_KEY`                    | Production only | Your RapidAPI key        |
| `RAPIDAPI_HOST`                   | All             | `jsearch.p.rapidapi.com` |
| `NEXT_PUBLIC_APP_URL`             | Production      | `https://your-app.vercel.app` |

> **Important**: Mark `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, and `RAPIDAPI_KEY` 
> as **Sensitive** so they don't appear in build logs.

---

## Step 4: Post-Deploy Checklist

### Verify
- [ ] Visit `https://your-app.vercel.app/api/health` — all should say "configured"
- [ ] Test signup with email
- [ ] Test Google OAuth login
- [ ] Upload a resume and run ATS analysis
- [ ] Search for jobs
- [ ] Check Supabase dashboard for data in tables

### Update Supabase Redirect URLs
After your first deploy, update Supabase auth settings:
1. **Site URL**: `https://your-app.vercel.app`
2. **Redirect URLs**: `https://your-app.vercel.app/api/auth/callback`

### Custom Domain (Optional)
1. In Vercel: **Settings** → **Domains** → add your domain
2. Update DNS records as instructed
3. Update Supabase Site URL + Redirect URLs to use the custom domain
4. Update `NEXT_PUBLIC_APP_URL` env var in Vercel

---

## Step 5: Monitoring & Costs

### Free Tier Limits

| Service      | Free Tier                        | When to Upgrade              |
|-------------|----------------------------------|------------------------------|
| Vercel      | 100GB bandwidth, serverless      | ~1000+ daily users           |
| Supabase    | 500MB DB, 1GB storage, 50k auth  | ~500+ active users           |
| Claude API  | Pay-per-use (~$0.01/analysis)    | Set billing alerts at $10    |
| JSearch     | 500 req/month                    | Switch to Pro at $30/mo      |

### Cost Estimation (First 100 Users)
- Vercel: $0 (free tier)
- Supabase: $0 (free tier)
- Claude API: ~$5–15/month (depends on usage)
- JSearch: $0 (free tier) → $10/mo if needed
- **Total: ~$5–15/month**

### Set Up Billing Alerts
- **Anthropic**: Console → Billing → Set spend limit
- **RapidAPI**: Dashboard → set usage alerts
- **Vercel**: Settings → Spend Management → set limit
- **Supabase**: Settings → Billing → usage alerts

---

## Troubleshooting

**Build fails on Vercel**
- Check that all env vars are set (especially `NEXT_PUBLIC_*` ones needed at build time)
- Check build logs for missing dependencies

**Auth redirect loop**
- Verify Supabase Site URL and Redirect URLs match your deployed domain exactly
- Ensure `/api/auth/callback` route exists

**Resume analysis times out**
- `vercel.json` sets 60s timeout for the analyze route
- If Claude is slow, check your API key and rate limits

**Jobs API returns empty**
- Verify `RAPIDAPI_KEY` is correct
- Check RapidAPI dashboard for quota usage
- JSearch free tier caps at 500 req/month
