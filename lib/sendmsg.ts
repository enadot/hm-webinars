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
    throw new SendmsgError(`sendmsg ${path} HTTP ${res.status}`, res.status, parsed);
  }
  // sendmsg returns HTTP 200 even on failure. The observed success shape is
  // {"success": true, "res": true, "result": {...}, "data": {...}} — we treat
  // an explicit `success === false` as an error and surface `ResultMessage`.
  if (parsed && typeof parsed === "object") {
    const rec = parsed as Record<string, unknown>;
    if (rec.success === false) {
      const result = (rec.result ?? rec.Result) as Record<string, unknown> | undefined;
      const msg = String(
        result?.ResultMessage ?? rec.ResultMessage ?? "(no ResultMessage)",
      );
      throw new SendmsgError(
        `sendmsg ${path} success=false: ${msg}`,
        undefined,
        parsed,
      );
    }
    // Legacy / SMS-side fallback: explicit `Status` code per the docs table.
    const status = rec.Status as number | string | undefined;
    if (status !== undefined) {
      const n = Number(status);
      if (Number.isFinite(n) && n !== 200 && n !== 10000) {
        const result = (rec.result ?? rec.Result) as Record<string, unknown> | undefined;
        const msg = String(
          result?.ResultMessage ?? rec.ResultMessage ?? "(no ResultMessage)",
        );
        throw new SendmsgError(`sendmsg ${path} status ${n}: ${msg}`, n, parsed);
      }
    }
  }
  return parsed as T;
}

async function getJson<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: { ...(token ? { Authorization: token } : {}) },
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
    throw new SendmsgError(`sendmsg ${path} HTTP ${res.status}`, res.status, parsed);
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

function extractListId(res: Record<string, unknown>): number | null {
  // Observed shape: {"data": {"mailingLists": [341376]}, "result": {...}}.
  const data = res.data as Record<string, unknown> | undefined;
  if (data && Array.isArray(data.mailingLists) && data.mailingLists.length > 0) {
    const first = data.mailingLists[0];
    if (typeof first === "number") return first;
    if (typeof first === "string" && /^\d+$/.test(first.trim())) return Number(first.trim());
  }
  // Fallback: pull the number out of ResultMessage's human-readable text.
  const result = (res.result ?? res.Result) as Record<string, unknown> | undefined;
  const rm = (result?.ResultMessage ?? res.ResultMessage ?? res.resultMessage) as
    | string
    | number
    | undefined;
  if (typeof rm === "string") {
    const m = rm.match(/mailingList\s+created\s+IDs?:\s*(\d+)/i);
    if (m) return Number(m[1]);
  }
  // Older / nested shape variants.
  const candidates: Array<unknown> = [
    res.NewListID, res.ListID, res.ListId, res.MailingListID, res.ID, res.id,
    result?.NewListID, result?.ListID, result?.ListId, result?.ID, result?.id,
  ];
  if (typeof rm === "number") candidates.push(rm);
  if (typeof rm === "string" && /^\d+$/.test(rm.trim())) candidates.push(Number(rm.trim()));
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
  }
  return null;
}

export async function createMailingList(
  creds: SendmsgCreds,
  name: string,
  description?: string,
): Promise<{ listId: number; raw: Record<string, unknown> }> {
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
  console.log("[sendmsg] CreateMalingList raw:", JSON.stringify(res));
  const listId = extractListId(res);
  if (listId == null) {
    throw new SendmsgError(
      `no list ID in CreateMalingList response: ${JSON.stringify(res)}`,
      undefined,
      res,
    );
  }
  return { listId, raw: res };
}

/**
 * GET /GetAllMalingLists — returns all mailing lists on the account.
 * Used as a fallback when CreateMalingList's response shape is unparseable
 * (we can find the just-created list by name).
 */
export async function getAllMailingLists(
  creds: SendmsgCreds,
): Promise<Record<string, unknown>> {
  const token = await getToken(creds);
  return await getJson<Record<string, unknown>>("/GetAllMalingLists", token);
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
): Promise<Record<string, unknown>> {
  const token = await getToken(creds);
  const res = await postJson<Record<string, unknown>>(
    "/AddUsersToLists",
    {
      users: [
        {
          EmailAddress: user.email,
          FirstName: user.firstName ?? "",
          LastName: user.lastName ?? "",
          // sendmsg's field is `Cellphone`, not `Phone` — was the silent reason
          // leads didn't fully sync earlier.
          Cellphone: user.phone ?? "",
        },
      ],
      mailingLists: [{ ExistingListID: listId }],
    },
    token,
  );
  console.log("[sendmsg] AddUsersToLists raw:", JSON.stringify(res));
  return res;
}

// ----- Messages / campaigns -----

export type SendmsgMessage = {
  subject: string;
  content: string;       // HTML
  innerName: string;     // internal label shown in the sendmsg dashboard
  senderEmail?: string;
  senderName?: string;
  /** 1 = RTL (Hebrew), 2 = LTR. Defaults to 1. */
  direction?: 1 | 2;
};

function buildMessage(
  m: SendmsgMessage,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  // Mirror the full docs-example shape — sendmsg's backend has NRE'd in the
  // past when optional fields were absent, so we always populate every field
  // they document, with safe defaults.
  const body: Record<string, unknown> = {
    MessageContent: m.content,
    MessageSubject: m.subject,
    MessageInnerName: m.innerName,
    MessageDirection: m.direction ?? 1,
    SenderEmailAddress: m.senderEmail ?? "",
    SenderName: m.senderName ?? "",
    MessageBackColor: "#ffffff",
    AddFacebook: false,
    AddForward: false,
    AddShowMessage: true,
  };
  if (extra) Object.assign(body, extra);
  return body;
}

/**
 * Format a JS Date (or "YYYY-MM-DDTHH:mm" literal) as a sendmsg-style
 * "YYYY-MM-DD HH:mm:ss" string in Asia/Jerusalem time.
 */
export function formatPostponeSendTime(input: Date | string): string {
  if (typeof input === "string") {
    // Treat the input as already-local "YYYY-MM-DDTHH:mm[:ss]".
    const m = input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) return `${m[1]} ${m[2]}:${m[3]}:${m[4] ?? "00"}`;
  }
  const d = typeof input === "string" ? new Date(input) : input;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

/**
 * Create a draft / scheduled message. Returns the new messageID.
 * If `postponeSendTime` is provided, sendmsg stores it on the draft.
 */
export async function createMessage(
  creds: SendmsgCreds,
  m: SendmsgMessage,
  options?: { postponeSendTime?: string },
): Promise<number> {
  const token = await getToken(creds);
  const body = buildMessage(
    m,
    options?.postponeSendTime ? { PostponeSendTime: options.postponeSendTime } : undefined,
  );
  const res = await postJson<Record<string, unknown>>(
    "/CreateMessage",
    body,
    token,
  );
  const id =
    (res.newMessageID as number | undefined) ??
    (res.NewMessageID as number | undefined) ??
    (res.MessageID as number | undefined) ??
    (res.messageID as number | undefined) ??
    (res.id as number | undefined);
  if (typeof id !== "number") {
    throw new SendmsgError("no messageID in CreateMessage response", undefined, res);
  }
  return id;
}

/**
 * POST /SendEmailToMailingLists — sends an inline Message to one or more
 * existing mailing lists. Passing `postponeSendTime` schedules it for a
 * future Asia/Jerusalem datetime (per the sendmsg PostponeSendTime field).
 *
 * The earlier draft-then-dispatch flow (CreateMessage → UseDraftID) returned
 * "Object reference not set" from the sendmsg backend, so we send the full
 * Message inline in a single call instead.
 */
export async function sendEmailToList(
  creds: SendmsgCreds,
  listIds: number[],
  message: SendmsgMessage,
  options?: { postponeSendTime?: string },
): Promise<Record<string, unknown>> {
  const token = await getToken(creds);
  const messageObj = buildMessage(
    message,
    options?.postponeSendTime ? { PostponeSendTime: options.postponeSendTime } : undefined,
  );
  const res = await postJson<Record<string, unknown>>(
    "/SendEmailToMailingLists",
    { Message: messageObj, MalingListIDs: listIds },
    token,
  );
  console.log("[sendmsg] SendEmailToMailingLists raw:", JSON.stringify(res));
  return res;
}

function extractMessageId(res: Record<string, unknown>): number | null {
  const data = res.data as Record<string, unknown> | undefined;
  if (data) {
    for (const key of ["messageID", "MessageID", "newMessageID", "NewMessageID", "messageId"]) {
      const v = data[key];
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
    if (Array.isArray(data.messages) && data.messages.length > 0) {
      const first = data.messages[0];
      if (typeof first === "number") return first;
    }
  }
  for (const key of ["newMessageID", "NewMessageID", "MessageID", "messageID"]) {
    const v = (res as Record<string, unknown>)[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/**
 * High-level: send `m` to `listId` now, or schedule for a future Israel-local
 * datetime (a YYYY-MM-DDTHH:mm string).
 */
export async function dispatchMessageToList(
  creds: SendmsgCreds,
  listId: number,
  m: SendmsgMessage,
  options?: { scheduledAtLocal?: string },
): Promise<{ messageId: number | null; raw: unknown }> {
  const postponeSendTime = options?.scheduledAtLocal
    ? formatPostponeSendTime(options.scheduledAtLocal)
    : undefined;
  const raw = await sendEmailToList(creds, [listId], m, { postponeSendTime });
  return { messageId: extractMessageId(raw), raw };
}
