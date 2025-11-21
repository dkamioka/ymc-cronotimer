# Google OAuth Setup Guide

Follow these steps to enable "Sign in with Google" for YMC Cronotimer.

## Part 1: Configure Google Cloud Console (5 minutes)

### Step 1: Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Project name: `YMC Cronotimer`
4. Click **Create**

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Create OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. User Type: Select **External** → Click **Create**
3. Fill in:
   - **App name**: `YMC Cronotimer`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. **Scopes**: Click **Save and Continue** (no changes needed)
6. **Test users**: Click **Save and Continue** (skip for now)
7. Click **Back to Dashboard**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `YMC Cronotimer Web`
5. **Authorized redirect URIs** → Click **Add URI**:
   - Add: `https://oaokydrcsqkgpatdfszj.supabase.co/auth/v1/callback`
   - For local dev, also add: `http://localhost:54321/auth/v1/callback`
6. Click **Create**
7. **IMPORTANT**: Copy the **Client ID** and **Client Secret** (you'll need these next)

## Part 2: Configure Supabase (2 minutes)

### Step 1: Add Google Provider

1. Go to https://app.supabase.com/project/oaokydrcsqkgpatdfszj/auth/providers
2. Find **Google** in the providers list
3. Click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste:
   - **Client ID**: (from Google Console Step 4)
   - **Client Secret**: (from Google Console Step 4)
6. Click **Save**

### Step 2: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173` (for local dev)
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - (Add your production URL later, e.g., `https://your-app.vercel.app/auth/callback`)
4. Click **Save**

## Part 3: Test It! (1 minute)

1. Start your dev server:
   ```bash
   cd .worktrees/feature/initial-setup
   npm run dev
   ```

2. Open http://localhost:5173

3. Click **"Continue with Google"**

4. Sign in with your Google account

5. You'll be redirected to the onboarding page to create your box

6. Fill in your name and box name

7. Click **Create My Box**

8. ✅ You're in! You should see the dashboard

## What Happens Behind the Scenes

1. **User clicks "Continue with Google"**
   - Redirects to Google's OAuth consent screen
   - User authorizes the app

2. **Google redirects back** to `/auth/callback`
   - Auth tokens are exchanged
   - User is authenticated with Supabase

3. **App checks if user profile exists**
   - If NO → Redirect to `/onboarding` to create a box
   - If YES → Redirect to `/:boxSlug/dashboard`

4. **Onboarding creates**:
   - A new `box` record (your CrossFit gym)
   - A `users` record linking your Google account to the box as owner

## Production Deployment

When deploying to production (e.g., Vercel):

1. **Update Google Console**:
   - Add production redirect URI: `https://your-domain.com/auth/callback`

2. **Update Supabase**:
   - Change Site URL to: `https://your-domain.com`
   - Add production redirect URL

## Troubleshooting

**"Redirect URI mismatch" error**
- Make sure the redirect URI in Google Console EXACTLY matches Supabase's callback URL
- Check for trailing slashes and http vs https

**User redirects to login after Google auth**
- Check browser console for errors
- Verify Supabase Site URL is set correctly
- Make sure you're not blocking cookies/third-party scripts

**"Access blocked: This app's request is invalid" error**
- Make sure you enabled Google+ API in Google Cloud Console
- Check that OAuth consent screen is configured

**User stuck on onboarding page**
- Check browser console for errors
- Verify the database migrations were run (`setup-all.sql`)
- Make sure RLS policies allow INSERT on `boxes` and `users` tables

## Next Steps

- Add email/password signup
- Add forgot password flow
- Add profile management
- Invite team members to your box
