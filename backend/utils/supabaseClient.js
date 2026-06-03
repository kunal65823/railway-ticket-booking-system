const { createClient } = require('@supabase/supabase-js');
const { requireEnv } = require('./loadEnv');

requireEnv(['SUPABASE_URL', ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_KEY']]);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

module.exports = supabase;
