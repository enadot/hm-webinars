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
  // sendmsg often returns HTTP 200 with a Status field signalling a logical
  // error (codes 410, 500, 530, etc. — see the API docs status-codes table).
  if (parsed && typeof parsed === "object") {
    const rec = parsed as Record<string, unknown>;
    const status = (rec.Status ?? rec.status) as number | string | undefined;
    if (status !== undefined) {
      const n = Number(status);
      if (Number.isFinite(n) && n !== 200 && n !== 10000) {
        const msg = String(rec.ResultMessage ?? rec.resultMessage ?? "(no ResultMessage)");
        throw new SendmsgError(
          `sendmsg ${path} status ${n}: ${msg}`,
          n,
          parsed,
        );
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
  // The Apiary page doesn't pin down the success-response shape; cover the
  // common variants AND the sendmsg pattern of returning the ID inside
  // ResultMessage as a string.
  const candidates: Array<unknown> = [
    res.NewListID, res.ListID, res.ListId, res.MailingListID, res.ID, res.id,
  ];
  const nested = res.Result as Record<string, unknown> | undefined;
  if (nested && typeof nested === "object") {
    candidates.push(nested.NewListID, nested.ListID, nested.ListId, nested.ID, nested.id);
  }
  const rm = res.ResultMessage ?? res.resultMessage;
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
  const body: Record<string, unknown> = {
    MessageContent: m.content,
    MessageSubject: m.subject,
    MessageInnerName: m.innerName,
    MessageDirection: m.direction ?? 1,
  };
  if (m.senderEmail) body.SenderEmailAddress = m.senderEmail;
  if (m.senderName) body.SenderName = m.senderName;
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
 * Dispatch an email to one or more existing mailing lists.
 * Message can be either a new inline message OR a reference to a draft
 * (useDraftId) created earlier with createMessage().
 */
export async function sendEmailToList(
  creds: SendmsgCreds,
  listIds: number[],
  message: SendmsgMessage | { useDraftId: number },
): Promise<Record<string, unknown>> {
  const token = await getToken(creds);
  const messageObj =
    "useDraftId" in message
      ? { UseDraftID: message.useDraftId }
      : buildMessage(message);
  const res = await postJson<Record<string, unknown>>(
    "/SendEmailToMailingLists",
    { Message: messageObj, MalingListIDs: listIds },
    token,
  );
  return res;
}

/**
 * High-level: send `m` to `listId` now, or schedule for a future Israel-local
 * datetime. Returns the sendmsg message ID when available.
 */
export async function dispatchMessageToList(
  creds: SendmsgCreds,
  listId: number,
  m: SendmsgMessage,
  options?: { scheduledAtLocal?: string }, // "YYYY-MM-DDTHH:mm"
): Promise<{ messageId: number | null; raw: unknown }> {
  if (options?.scheduledAtLocal) {
    const postpone = formatPostponeSendTime(options.scheduledAtLocal);
    const messageId = await createMessage(creds, m, { postponeSendTime: postpone });
    const raw = await sendEmailToList(creds, [listId], { useDraftId: messageId });
    return { messageId, raw };
  }
  const raw = await sendEmailToList(creds, [listId], m);
  const id =
    (raw.newMessageID as number | undefined) ??
    (raw.NewMessageID as number | undefined) ??
    (raw.MessageID as number | undefined) ??
    (raw.messageID as number | undefined) ??
    null;
  return { messageId: id, raw };
}
