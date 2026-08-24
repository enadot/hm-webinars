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
