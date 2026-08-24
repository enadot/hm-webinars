/**
 * Generates lib/campaign-fallback.generated.json from the campaign-seeding
 * migrations, so the public pages can still render when the database is
 * unreachable (see lib/campaign-source.ts).
 *
 * Run after adding or editing a campaign seed/update migration:
 *   npm run build:campaign-fallback
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "prisma", "migrations");
const outFile = join(root, "lib", "campaign-fallback.generated.json");

const CFG = "$cfg$";
const campaigns = new Map();

for (const dir of readdirSync(migrationsDir).sort()) {
  const file = join(migrationsDir, dir, "migration.sql");
  let sql;
  try {
    sql = readFileSync(file, "utf8");
  } catch {
    continue; // migration_lock.toml and friends
  }
  if (!sql.includes('"Campaign"') || !sql.includes(CFG)) continue;

  const start = sql.indexOf(CFG);
  const end = sql.indexOf(CFG, start + CFG.length);
  if (end === -1) throw new Error(`${dir}: unterminated ${CFG} block`);
  const config = sql.slice(start + CFG.length, end);
  JSON.parse(config); // fail loudly on a malformed seed
  const rest = sql.slice(0, start) + sql.slice(end + CFG.length);

  if (/UPDATE\s+"Campaign"/.test(rest)) {
    const slug = rest.match(/WHERE\s+"slug"\s*=\s*'([^']+)'/)?.[1];
    if (!slug) throw new Error(`${dir}: UPDATE without a "slug" filter`);
    const prev = campaigns.get(slug);
    if (!prev) throw new Error(`${dir}: updates unseeded campaign "${slug}"`);
    campaigns.set(slug, { ...prev, config });
    continue;
  }

  // INSERT INTO "Campaign" (...) VALUES ('id', 'slug', 'name', 'templateId', <config>, ...)
  const values = rest.match(/VALUES\s*\(([\s\S]*?)\)\s*ON CONFLICT/)?.[1];
  if (!values) throw new Error(`${dir}: unrecognised Campaign statement`);
  const literals = [...values.matchAll(/'((?:[^']|'')*)'/g)].map((m) => m[1].replace(/''/g, "'"));
  const [id, slug, name, templateId] = literals;
  if (!slug || !templateId) throw new Error(`${dir}: could not read slug/templateId`);
  campaigns.set(slug, { id, slug, name, templateId, config });
}

const sorted = Object.fromEntries([...campaigns.entries()].sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(outFile, JSON.stringify(sorted, null, 2) + "\n");
console.log(`campaign fallback: ${Object.keys(sorted).length} campaign(s) → ${outFile}`);
for (const c of Object.values(sorted)) console.log(`  ${c.slug} (${c.templateId})`);
