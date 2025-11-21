#!/usr/bin/env node

/**
 * Run database migrations using Supabase REST API
 * Usage: SUPABASE_SERVICE_KEY=your_key node run-migrations.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://oaokydrcsqkgpatdfszj.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('\nUsage:');
  console.error('  SUPABASE_SERVICE_KEY=your_key node run-migrations.mjs');
  console.error('\nGet your service key from:');
  console.error('  Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'oaokydrcsqkgpatdfszj.supabase.co',
      path: '/rest/v1/rpc/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  const filepath = path.join(__dirname, 'supabase/migrations', filename);
  const sql = fs.readFileSync(filepath, 'utf8');

  try {
    await executeSQL(sql);
    console.log(`✅ ${filename} completed successfully`);
  } catch (error) {
    console.error(`❌ ${filename} failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log('Project: YMC Cronotimer');
  console.log('Database: oaokydrcsqkgpatdfszj.supabase.co\n');

  try {
    await runMigration('20241120000001_create_boxes_and_users.sql');
    await runMigration('20241120000002_create_workouts.sql');
    await runMigration('20241120000003_create_rls_policies.sql');

    console.log('\n✅ All migrations completed successfully!');
    console.log('\n📊 Database tables created:');
    console.log('  - boxes');
    console.log('  - users');
    console.log('  - workouts');
    console.log('  - sections');
    console.log('  - exercises');
    console.log('  - rounds');
    console.log('  - execution_logs');
    console.log('\n🔒 RLS policies enabled for multi-tenant security');
    console.log('\n✨ Your database is ready!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
