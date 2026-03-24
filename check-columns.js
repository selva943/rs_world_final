import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) env[key.trim()] = valueParts.join('=').trim();
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
  console.log('Fetching one row from "products" to check columns...');
  const { data, error } = await supabase.from('products').select('*').limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns found in "products":', Object.keys(data[0]));
    console.log('Row data:', data[0]);
  } else {
    console.log('No rows found in "products". Checking table existence...');
    const { error: tableError } = await supabase.from('products').select('count', { count: 'exact', head: true });
    console.log('Table "products" existence check:', tableError ? 'Error/Not Found' : 'Exists');
  }
}

checkColumns();
