import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim().replace(/"/g, '') : '';
const key = keyMatch ? keyMatch[1].trim().replace(/"/g, '') : '';

const supabase = createClient(url, key);

async function run() {
  const checkC = await supabase.from('animals').select('*').limit(1);
  console.log('ANIMALS SCHEMA:', checkC);
}

run();
