import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      name,
      recipe_ingredients (
        id,
        quantity,
        products (*)
      )
    `)
    .limit(1);
    
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

check();
