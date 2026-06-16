import "server-only";

import { prisma } from "@/lib/db";
import type { SendmsgCreds } from "@/lib/sendmsg";

/**
 * Global app settings, stored in the AppSetting key/value table.
 * Server-side only — values are plaintext, not exposed to the browser.
 */

const KEY_SENDMSG_SITE_ID = "sendmsg.siteId";
const KEY_SENDMSG_PASSWORD = "sendmsg.password";
const KEY_SENDMSG_DEFAULT_SENDER_EMAIL = "sendmsg.defaultSenderEmail";
const KEY_SENDMSG_DEFAULT_SENDER_NAME = "sendmsg.defaultSenderName";

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

export async function getSendmsgDefaultSender(): Promise<{
  email: string | null;
  name: string | null;
}> {
  const rows = await prisma.appSetting.findMany({
    where: {
      key: { in: [KEY_SENDMSG_DEFAULT_SENDER_EMAIL, KEY_SENDMSG_DEFAULT_SENDER_NAME] },
    },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    email: map.get(KEY_SENDMSG_DEFAULT_SENDER_EMAIL) ?? null,
    name: map.get(KEY_SENDMSG_DEFAULT_SENDER_NAME) ?? null,
  };
}

export async function setSendmsgConfig(input: {
  siteId: number | null;
  password: string | null;
  defaultSenderEmail?: string | null;
  defaultSenderName?: string | null;
}): Promise<void> {
  const tasks: Promise<unknown>[] = [
    upsertOrDelete(KEY_SENDMSG_SITE_ID, input.siteId == null ? null : String(input.siteId)),
    upsertOrDelete(KEY_SENDMSG_PASSWORD, input.password),
  ];
  if (input.defaultSenderEmail !== undefined) {
    tasks.push(upsertOrDelete(KEY_SENDMSG_DEFAULT_SENDER_EMAIL, input.defaultSenderEmail));
  }
  if (input.defaultSenderName !== undefined) {
    tasks.push(upsertOrDelete(KEY_SENDMSG_DEFAULT_SENDER_NAME, input.defaultSenderName));
  }
  await Promise.all(tasks);
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
 * Public-safe summary: whether sendmsg is configured + the site ID + the
 * default sender (not the password). Used for admin UI state.
 */
export async function getSendmsgPublicStatus(): Promise<{
  configured: boolean;
  siteId: number | null;
  defaultSenderEmail: string | null;
  defaultSenderName: string | null;
}> {
  const [cfg, sender] = await Promise.all([
    getSendmsgConfig(),
    getSendmsgDefaultSender(),
  ]);
  return {
    configured: !!cfg,
    siteId: cfg?.siteId ?? null,
    defaultSenderEmail: sender.email,
    defaultSenderName: sender.name,
  };
}
