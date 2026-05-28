import { createClient } from "@supabase/supabase-js";

const BASE = process.env.SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!BASE || !KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.");
  process.exit(1);
}

const client = createClient(BASE, KEY);

// Run each ALTER TABLE separately via a stored-procedure-style rpc.
// Supabase doesn't have a built-in exec_sql, so we use the REST /sql endpoint
// via fetch with the service-role key.

async function sql(query) {
  const res = await fetch(`${BASE}/rest/v1/rpc/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": KEY,
      "Authorization": `Bearer ${KEY}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

const statements = [
  "ALTER TABLE foods ADD COLUMN IF NOT EXISTS fiber_per_100g NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS protein_per_100g_snapshot NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS carbs_per_100g_snapshot NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS fat_per_100g_snapshot NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS fiber_per_100g_snapshot NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS calculated_protein NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS calculated_carbs NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS calculated_fat NUMERIC",
  "ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS calculated_fiber NUMERIC",
];

for (const stmt of statements) {
  try {
    await sql(stmt);
    console.log("OK:", stmt.substring(0, 60));
  } catch (e) {
    console.error("FAIL:", stmt.substring(0, 60), "->", e.message.substring(0, 120));
  }
}

console.log("Done.");
