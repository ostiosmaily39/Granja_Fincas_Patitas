import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim().replace(/"/g, '') : '';
const key = keyMatch ? keyMatch[1].trim().replace(/"/g, '') : '';

const supabase = createClient(url, key);

async function run() {
  let cowCheck = await supabase.from('animals').select('id, notes').limit(1);
  const animalId = cowCheck.data?.[0]?.id;
  if (!animalId) return console.log('No cows to test');

  let profileCheck = await supabase.from('profiles').select('id').limit(1);
  const createdBy = profileCheck.data?.[0]?.id || null;

  const res = await supabase.from('milk_production').insert([
    {
      animal_id: animalId,
      production_date: '2026-04-12',
      shift: 'manana',
      quantity_liters: 15.5,
      notes: 'Test note OK',
      registered_by: createdBy
    }
  ]);
  console.log('MILK Result:', res.error ? res.error : 'Success!');

  const errRes = await supabase.from('egg_production').insert([
    {
      lot_name: 'Lote Test',
      production_date: '2026-04-12',
      quantity_units: 300,
      discarded_units: 5,
      notes: 'Test egg OK',
      registered_by: createdBy
    }
  ]);
  console.log('EGG Result:', errRes.error ? errRes.error : 'Success!');
}

run();
