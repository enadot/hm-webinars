/**
 * Runs `prisma migrate deploy`, tolerating an unreachable database.
 *
 * The build command runs migrations before `next build`, so while Neon's
 * compute is suspended or over quota, every deploy failed — including the
 * deploys meant to make the site survive exactly that outage. A database we
 * cannot reach has no migrations to miss: the next deploy applies them once it
 * is back. Any other failure (a bad migration, a drifted schema) still fails
 * the build, loudly.
 */
import { spawnSync } from "node:child_process";

const CONNECTION_ERRORS = [
  "P1001", // can't reach database server
  "P1017", // server has closed the connection
  "Can't reach database server",
];

// `directUrl = env("DIRECT_URL")` in the schema is mandatory once declared, and
// only the Production environment defines it — so every Preview build died on
// P1012 before it reached the database. The pooled URL is a usable stand-in for
// migrations, so fall back to it rather than failing the build over a variable
// that exists one environment over.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  console.warn("[migrate] DIRECT_URL is not set — falling back to DATABASE_URL.");
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// No database configured at all. Outside production that is a preview with no
// database attached: the pages render from the in-repo snapshot, so let the
// build through. In production it is a misconfiguration and must be loud.
if (!process.env.DATABASE_URL) {
  if (process.env.VERCEL_ENV === "production") {
    console.error("[migrate] DATABASE_URL is not set in production — failing the build.");
    process.exit(1);
  }
  console.warn("[migrate] no DATABASE_URL in this environment — skipping migrations.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});

process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

if (result.status === 0) process.exit(0);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
if (CONNECTION_ERRORS.some((marker) => output.includes(marker))) {
  console.warn(
    "\n[migrate] the database is unreachable — continuing the build without " +
      "applying migrations. They will be applied by the next deploy once it is back.\n",
  );
  process.exit(0);
}

console.error("\n[migrate] migrations failed for a reason other than connectivity — failing the build.\n");
process.exit(result.status ?? 1);
