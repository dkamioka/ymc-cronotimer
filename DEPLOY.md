# Deployment Guide

## Vercel (recommended)
- Prereqs: Vercel account; repo on GitHub with `feature/initial-setup` merged or pushed. Keep secrets out of git.
- Create project: Vercel dashboard → Add New Project → import repo.
- Build settings: Framework = Vite; Install = `npm install`; Build = `npm run build`; Output = `dist`.
- Env vars (Project Settings → Environment Variables): `VITE_SUPABASE_URL=https://oaokydrcsqkgpatdfszj.supabase.co`, `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb2t5ZHJjc3FrZ3BhdGRmc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDM0NzYsImV4cCI6MjA3OTIxOTQ3Nn0.m6XOA12DVic2_jp_wNTUHiNbedSBAqWVbr_z4ccIaWk`. Apply to all environments used (Preview/Production).
- Deploy: trigger first deploy; Vercel produces a Production URL and Preview URLs per PR/branch.
- Post-deploy checks: open the deployed URL, confirm Supabase calls succeed via browser Network tab, and check Vercel logs for build warnings.

## Netlify (alternative)
- Site config: Build command `npm run build`; Publish directory `dist`; Node 18+ runtime.
- Env vars: add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Site settings.
- Deploy via GitHub import or CLI (`netlify deploy --prod` after `netlify init`).
- Validate the live site and Supabase connectivity after deploy.

## Local production check
- From `.worktrees/feature/initial-setup`: `npm run build` then `npm run preview -- --host --port 4173` to serve the production bundle locally (uses `.env*` if present).
