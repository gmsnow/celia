const { Pool, Client } = require("pg");

const SOURCE = "postgresql://postgres:123@localhost:5432/celia";
const TARGET = "postgresql://postgres.jkviqemannclsggacymn:snow777296855@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

const TABLES = [
  "user", "role_permissions",
  "account", "session", "verification",
  "employees", "expenses", "products", "product_sales", "advances",
  "balance_charge", "hobani_income", "copy_records", "audit_log",
  "notifications", "settings", "nas_shares", "nas_listing",
  "transfer_agents", "transfer_devices", "transfer_jobs", "transfer_items",
];

function escapeId(name) {
  return `"${name}"`;
}

async function main() {
  console.log("Cloning data from local PostgreSQL to Supabase pooler...\n");

  const src = new Client({ connectionString: SOURCE });
  const tgt = new Client({ connectionString: TARGET, ssl: { rejectUnauthorized: false } });
  await src.connect();
  await tgt.connect();
  console.log("Connected to both databases.\n");

  let totalRows = 0;

  for (const table of TABLES) {
    try {
      const { rows } = await src.query(`SELECT COUNT(*) AS cnt FROM ${escapeId(table)}`);
      const count = parseInt(rows[0].cnt, 10);
      if (count === 0) {
        console.log(`  ${table}: 0 rows (skipped)`);
        continue;
      }

      const all = await src.query(`SELECT * FROM ${escapeId(table)}`);
      if (all.rows.length === 0) continue;

      const cols = all.fields.map((f) => f.name);
      const colList = cols.map((c) => escapeId(c)).join(", ");

      await tgt.query("BEGIN");
      try {
        await tgt.query(`DELETE FROM ${escapeId(table)}`);
        for (const row of all.rows) {
          const placeholders = cols.map((_, j) => `$${j + 1}`);
          const values = cols.map((c) => {
            let val = row[c];
            if (val === undefined || val === null) return null;
            if (typeof val === "object") return JSON.stringify(val);
            return val;
          });
          await tgt.query(
            `INSERT INTO ${escapeId(table)} (${colList}) VALUES (${placeholders})`,
            values
          );
        }
        await tgt.query("COMMIT");
      } catch (e) {
        await tgt.query("ROLLBACK");
        throw e;
      }

      console.log(`  ${table}: ${count} rows cloned`);
      totalRows += count;
    } catch (e) {
      console.error(`  ${table}: FAILED - ${e.message}`);
    }
  }

  console.log(`\nDone! ${totalRows} total rows cloned.`);
  await src.end();
  await tgt.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
