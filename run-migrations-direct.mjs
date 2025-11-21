#!/usr/bin/env node

/**
 * Run database migrations directly using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://oaokydrcsqkgpatdfszj.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  const filepath = path.join(__dirname, 'supabase/migrations', filename);
  const sql = fs.readFileSync(filepath, 'utf8');

  try {
    // Split into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.startsWith('--')) continue;

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        console.error(`Statement ${i + 1} failed:`, error);
        throw error;
      }
    }

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
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
