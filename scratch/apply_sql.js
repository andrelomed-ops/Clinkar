
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
        console.error("Usage: node apply_migration.js <file>");
        process.exit(1);
    }

    console.log(`Reading migration: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log("Applying migration to Supabase...");
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        // Fallback: If exec_sql RPC doesn't exist, we might need another way or just report it
        console.error("Error applying migration via RPC:", error);
        console.log("Tip: Ensure you have an 'exec_sql' function in your Supabase DB or use the Dashboard.");
        process.exit(1);
    }

    console.log("Migration applied successfully!");
}

applyMigration();
