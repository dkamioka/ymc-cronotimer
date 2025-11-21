# Google OAuth Production Setup

This guide configures Google OAuth for your **production** deployment on Vercel (or any hosting platform).

## Prerequisites

✅ You've already completed local Google OAuth setup (GOOGLE-OAUTH-SETUP.md)
✅ You have your Google Cloud project set up
✅ You have your Client ID and Client Secret saved

---

## Step 1: Deploy to Vercel (10 minutes)

### **Option A: Deploy via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `dkamioka/ymc-cronotimer`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `.worktrees/feature/initial-setup` (if deploying from worktree) OR leave as `./` (if deploying from main after merge)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variables**:
   - Name: `VITE_SUPABASE_URL`
     Value: `https://oaokydrcsqkgpatdfszj.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb2t5ZHJjc3FrZ3BhdGRmc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDM0NzYsImV4cCI6MjA3OTIxOTQ3Nn0.m6XOA12DVic2_jp_wNTUHiNbedSBAqWVbr_z4ccIaWk`
6. Click **"Deploy"**
7. Wait for deployment (~2 minutes)
8. **Copy your production URL** (e.g., `https://ymc-cronotimer.vercel.app`)

### **Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from worktree
cd .worktrees/feature/initial-setup
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: ymc-cronotimer
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://oaokydrcsqkgpatdfszj.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb2t5ZHJjc3FrZ3BhdGRmc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDM0NzYsImV4cCI6MjA3OTIxOTQ3Nn0.m6XOA12DVic2_jp_wNTUHiNbedSBAqWVbr_z4ccIaWk

# Deploy to production
vercel --prod
```

---

## Step 2: Update Google Cloud Console (3 minutes)

1. Go to https://console.cloud.google.com
2. Select your project: **YMC Cronotimer**
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth client: **YMC Cronotimer Web**
5. Under **Authorized redirect URIs**, click **"+ Add URI"**
6. Add your **production callback URL**:
   ```
   https://your-vercel-url.vercel.app/auth/callback
   ```
   Replace `your-vercel-url` with your actual Vercel domain

   **Example**: If your Vercel URL is `https://ymc-cronotimer.vercel.app`, add:
   ```
   https://ymc-cronotimer.vercel.app/auth/callback
   ```

7. Click **"Save"**

**Your redirect URIs should now include:**
- ✅ `https://oaokydrcsqkgpatdfszj.supabase.co/auth/v1/callback` (Supabase)
- ✅ `http://localhost:54321/auth/v1/callback` (local dev)
- ✅ `http://localhost:5173/auth/callback` (local app)
- ✅ `https://your-app.vercel.app/auth/callback` (production)

---

## Step 3: Update Supabase Configuration (2 minutes)

1. Go to https://app.supabase.com/project/oaokydrcsqkgpatdfszj/auth/url-configuration

2. Update **Site URL**:
   - Change from: `http://localhost:5173`
   - To: `https://your-vercel-url.vercel.app`

3. Add **Additional Redirect URLs**:
   - Keep: `http://localhost:5173/auth/callback` (for local dev)
   - Add: `https://your-vercel-url.vercel.app/auth/callback` (production)

4. Click **"Save"**

---

## Step 4: Test Production Login (1 minute)

1. Open your production URL: `https://your-vercel-url.vercel.app`
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. Complete onboarding (if first time)
5. ✅ You should be logged in!

---

## Custom Domain Setup (Optional)

If you want to use a custom domain (e.g., `cronotimer.yourdomain.com`):

### **1. Add domain to Vercel**

1. Go to Vercel project settings → **Domains**
2. Click **"Add"**
3. Enter your domain: `cronotimer.yourdomain.com`
4. Follow DNS configuration instructions

### **2. Update Google Console**

Add redirect URI:
```
https://cronotimer.yourdomain.com/auth/callback
```

### **3. Update Supabase**

- Site URL: `https://cronotimer.yourdomain.com`
- Redirect URL: `https://cronotimer.yourdomain.com/auth/callback`

---

## Multiple Environments Setup

If you want separate environments (staging, production):

### **Staging Environment**

1. **Vercel**: Create a separate project for staging
2. **Google Console**: Add redirect URI for staging:
   ```
   https://ymc-cronotimer-staging.vercel.app/auth/callback
   ```
3. **Supabase**: You can use the same Supabase project or create a separate one

### **Environment-Specific URLs**

Vercel automatically creates preview URLs for each branch:
- **Production**: `https://ymc-cronotimer.vercel.app` (from `main` branch)
- **Preview**: `https://ymc-cronotimer-git-feature-xyz.vercel.app` (from feature branches)

**To allow Google OAuth on preview deployments:**

1. In Google Console, add wildcard redirect:
   ```
   https://ymc-cronotimer-*.vercel.app/auth/callback
   ```
   ⚠️ **Note**: Google doesn't support wildcards, so you'll need to add each preview URL manually, OR just test OAuth in production

---

## Troubleshooting Production Issues

### **"Redirect URI mismatch" in production**
- Check that you added the EXACT production URL to Google Console
- Make sure there's no trailing slash
- Verify https (not http)

### **User can login locally but not in production**
- Check Supabase Site URL is set to production URL
- Verify environment variables are set in Vercel
- Check browser console for errors

### **Environment variables not working**
- In Vercel dashboard → Settings → Environment Variables
- Make sure variables are applied to "Production" and "Preview"
- Redeploy after adding variables

### **OAuth works but app breaks after login**
- Check that database migrations were run (`setup-all.sql`)
- Verify Supabase URL in environment variables is correct
- Check Vercel deployment logs for errors

---

## Security Best Practices

✅ **Never commit** `.env` files
✅ **Use environment variables** in Vercel for secrets
✅ **Rotate secrets** if they're ever exposed
✅ **Use HTTPS** always in production
✅ **Enable Supabase RLS** policies (already done)
✅ **Monitor** Supabase auth logs for suspicious activity

---

## Production Checklist

Before going live, verify:

- [ ] Production URL deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Google OAuth redirect URI includes production URL
- [ ] Supabase Site URL updated to production
- [ ] Supabase redirect URLs include production
- [ ] Database migrations run (`setup-all.sql`)
- [ ] Test Google login in production
- [ ] Test onboarding flow
- [ ] Test dashboard access
- [ ] Check browser console for errors
- [ ] Verify RLS policies are working

---

## Quick Reference

**Your Production URLs to configure:**

1. **Vercel URL**: `https://your-app.vercel.app`
2. **Google redirect URI**: `https://your-app.vercel.app/auth/callback`
3. **Supabase Site URL**: `https://your-app.vercel.app`
4. **Supabase Redirect URL**: `https://your-app.vercel.app/auth/callback`

Replace `your-app` with your actual Vercel project name.

---

## Need Help?

- **Vercel docs**: https://vercel.com/docs
- **Supabase auth docs**: https://supabase.com/docs/guides/auth
- **Google OAuth docs**: https://developers.google.com/identity/protocols/oauth2

Your production OAuth setup is complete! 🎉
