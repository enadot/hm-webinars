import { PrismaClient, Prisma } from "@prisma/client";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Neon scale-to-zero: after an idle period the serverless compute suspends, and
 * the first query that hits it while it wakes up fails with
 * `PrismaClientInitializationError` / P1001 ("Can't reach database server").
 *
 * These are *pre-execution* connection failures — the query never reached the
 * database — so retrying is safe for reads AND writes (no risk of double-apply).
 * We deliberately do NOT retry mid-query timeouts (P1002/P1008), which could
 * have partially executed a write.
 */
function isColdStartError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001: can't reach DB server · P1017: server has closed the connection
    return e.code === "P1001" || e.code === "P1017";
  }
  return false;
}

const MAX_ATTEMPTS = 5;

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Transparent retry/backoff around every operation (model ops + raw queries).
  // Total worst-case backoff ≈ 250+500+1000+2000 = 3.75s, comfortably inside a
  // serverless function timeout, and enough for a Neon cold start to finish.
  return client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        let delay = 250;
        for (let attempt = 1; ; attempt++) {
          try {
            return await query(args);
          } catch (e) {
            if (attempt >= MAX_ATTEMPTS || !isColdStartError(e)) throw e;
            console.warn(
              `[db] cold-start retry ${attempt}/${MAX_ATTEMPTS - 1} for ` +
                `${model ?? "raw"}.${operation} — waiting ${delay}ms`,
            );
            await sleep(delay);
            delay = Math.min(delay * 2, 2000);
          }
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
