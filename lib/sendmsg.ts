import "server-only";

/**
 * שלח מסר (sendmsg) REST API client.
 *
 * Auth flow: POST /token with {siteID, password} → {Token}; the token is
 * valid 12h and goes in the Authorization header on every other call.
 *
 * We cache tokens in-process for 11h. This module is server-only — credentials
 * never reach the browser.
 *
 * Base URL and endpoint shapes per https://sendmsgapi.docs.apiary.io
 */

const BASE = "https://gconvertrest.sendmsg.co.il/api/Sendmsg";
const TOKEN_TTL_MS = 11 * 60 * 60 * 1000;

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export type SendmsgCreds = { siteId: number; password: string };

export class SendmsgError extends Error {
  status?: number;
  body?: unknown;
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = text;
  }
  if (!res.ok) {
    throw new SendmsgError(`sendmsg ${path} ${res.status}`, res.status, parsed);
  }
  return parsed as T;
}

export async function getToken(creds: SendmsgCreds): Promise<string> {
  const key = `${creds.siteId}:${creds.password}`;
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  const res = await postJson<{ Token?: string; token?: string }>("/token", {
    siteID: creds.siteId,
    password: creds.password,
  });
  const token = res.Token || res.token;
  if (!token) {
    throw new SendmsgError("no token field in response", undefined, res);
  }
  tokenCache.set(key, { token, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

export async function testConnection(
  creds: SendmsgCreds,
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  try {
    // Bypass cache so a stale-but-cached token doesn't mask a fresh password error.
    tokenCache.delete(`${creds.siteId}:${creds.password}`);
    await getToken(creds);
    return { ok: true };
  } catch (e) {
    if (e instanceof SendmsgError) {
      return { ok: false, error: e.message, status: e.status };
    }
    return { ok: false, error: String(e) };
  }
}

export async function createMailingList(
  creds: SendmsgCreds,
  name: string,
  description?: string,
): Promise<number> {
  const token = await getToken(creds);
  const res = await postJson<Record<string, unknown>>(
    "/CreateMalingList",
    {
      IsNewList: true,
      NewListName: name,
      NewListDescription: description ?? "",
    },
    token,
  );
  // The API's exact response field name for new-list ID isn't documented in
  // the public Apiary page; accept the likely variants.
  const id =
    (res.NewListID as number | undefined) ??
    (res.ListID as number | undefined) ??
    (res.ListId as number | undefined) ??
    (res.MailingListID as number | undefined) ??
    (res.ID as number | undefined) ??
    (res.id as number | undefined);
  if (typeof id !== "number") {
    throw new SendmsgError("no list ID in response", undefined, res);
  }
  return id;
}

export type SendmsgUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export async function addUserToList(
  creds: SendmsgCreds,
  listId: number,
  user: SendmsgUser,
): Promise<void> {
  const token = await getToken(creds);
  await postJson(
    "/AddUsersToLists",
    {
      users: [
        {
          EmailAddress: user.email,
          FirstName: user.firstName ?? "",
          LastName: user.lastName ?? "",
          Phone: user.phone ?? "",
        },
      ],
      mailingLists: [{ ExistingListID: listId }],
    },
    token,
  );
}
