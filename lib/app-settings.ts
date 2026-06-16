import "server-only";

import { prisma } from "@/lib/db";
import type { SendmsgCreds } from "@/lib/sendmsg";

/**
 * Global app settings, stored in the AppSetting key/value table.
 * Server-side only — values are plaintext, not exposed to the browser.
 */

const KEY_SENDMSG_SITE_ID = "sendmsg.siteId";
const KEY_SENDMSG_PASSWORD = "sendmsg.password";

export type SendmsgConfig = SendmsgCreds | null;

export async function getSendmsgConfig(): Promise<SendmsgConfig> {
  const rows = await prisma.appSetting.findMany({
    where: { key: { in: [KEY_SENDMSG_SITE_ID, KEY_SENDMSG_PASSWORD] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const siteIdRaw = map.get(KEY_SENDMSG_SITE_ID);
  const password = map.get(KEY_SENDMSG_PASSWORD);
  if (!siteIdRaw || !password) return null;
  const siteId = Number(siteIdRaw);
  if (!Number.isFinite(siteId)) return null;
  return { siteId, password };
}

export async function setSendmsgConfig(input: {
  siteId: number | null;
  password: string | null;
}): Promise<void> {
  await Promise.all([
    upsertOrDelete(KEY_SENDMSG_SITE_ID, input.siteId == null ? null : String(input.siteId)),
    upsertOrDelete(KEY_SENDMSG_PASSWORD, input.password),
  ]);
}

async function upsertOrDelete(key: string, value: string | null): Promise<void> {
  if (value === null || value === "") {
    await prisma.appSetting.deleteMany({ where: { key } });
    return;
  }
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Public-safe summary: whether sendmsg is configured + the site ID. Never
 * returns the password. Use this for admin UI state, not for API calls.
 */
export async function getSendmsgPublicStatus(): Promise<{
  configured: boolean;
  siteId: number | null;
}> {
  const cfg = await getSendmsgConfig();
  return { configured: !!cfg, siteId: cfg?.siteId ?? null };
}
