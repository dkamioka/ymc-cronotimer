/**
 * Database Setup Script
 * Run with: npx tsx setup-database.ts
 *
 * This script pushes all migrations to the remote Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY! // Need service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable')
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(filename: string) {
  console.log(`\nRunning migration: ${filename}`)
  const sql = readFileSync(join(__dirname, 'supabase/migrations', filename), 'utf-8')

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error(`❌ Error in ${filename}:`, error)
    throw error
  }

  console.log(`✅ ${filename} completed`)
}

async function main() {
  console.log('Starting database setup...\n')

  try {
    await runMigration('20241120000001_create_boxes_and_users.sql')
    await runMigration('20241120000002_create_workouts.sql')
    await runMigration('20241120000003_create_rls_policies.sql')

    console.log('\n✅ All migrations completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
