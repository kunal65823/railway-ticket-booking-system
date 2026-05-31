// Quick test script to validate Supabase connection and table access
require('./loadEnv');
const supabase = require('./supabaseClient');

async function test() {
  try {
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'set' : 'MISSING');
    const res = await supabase.from('users').select('*').limit(1);
    console.log('Response:', res);
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
