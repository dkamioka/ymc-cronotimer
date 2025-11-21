# Quick Setup Guide

Follow these steps to get YMC Cronotimer running:

## Step 1: Setup Database Schema

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project: `ymc-cronotimer`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `setup-all.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

✅ You should see "Success. No rows returned" - this is correct!

## Step 2: Create Test User

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: `test@example.com`
   - **Password**: `testpass123`
   - **Auto Confirm User**: ✅ (check this box)
4. Click **Create user**
5. **IMPORTANT**: Copy the user's UUID (it's shown in the users table, looks like: `a1b2c3d4-...`)

## Step 3: Link User to Test Box

1. Go back to **SQL Editor**
2. Open the `setup-test-data.sql` file
3. Find the line: `'YOUR_USER_UUID_HERE'::uuid`
4. Replace `YOUR_USER_UUID_HERE` with the UUID you copied in Step 2
5. Copy the entire modified SQL
6. Paste into SQL Editor
7. Click **Run**

✅ You should see "Success. No rows returned"

## Step 4: Start Development Server

```bash
cd .worktrees/feature/initial-setup
npm run dev
```

## Step 5: Login!

1. Open http://localhost:5173
2. Login with:
   - **Email**: `test@example.com`
   - **Password**: `testpass123`
3. You should be redirected to: `http://localhost:5173/demo-box/dashboard`

✅ **Success!** You're now logged in and the app is working!

## Troubleshooting

**Login fails with "Invalid login credentials"**
- Make sure you created the auth user in Step 2
- Make sure you checked "Auto Confirm User"

**Redirects to login after successful authentication**
- Check that you replaced the UUID in setup-test-data.sql correctly
- Verify the user was created in the `users` table (SQL Editor → Run: `SELECT * FROM users;`)

**Can't see any data**
- Run: `SELECT * FROM boxes;` to verify the box was created
- Run: `SELECT * FROM users;` to verify your user is linked to the box

## What's Next?

The foundation is complete! Now you can:
- Explore the codebase in `src/`
- Start building features (Editor, TV Mode, etc.)
- See `docs/plans/2025-11-20-cronotimer-design.md` for full feature specifications
