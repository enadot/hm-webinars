/**
 * Transactional mail for registrants.
 *
 * שלח מסר is a list broadcaster — its only send endpoint takes mailing list
 * IDs — so it cannot address a single registrant. Confirmation mail therefore
 * goes through Resend, which the admin bug-report route already uses, while
 * the scheduled reminders stay on שלח מסר where the audience already lives.
 */

/** The API key, or null when transactional mail is not configured. */
export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

/**
 * Sender address, as "Name <a@b.com>" or a bare address. RESEND_FROM wins;
 * otherwise the שלח מסר default sender is reused, and finally the same
 * onboarding@resend.dev fallback the bug-report route relies on — which only
 * delivers to the Resend account's own address until a domain is verified.
 */
export function getResendFrom(fallbackName?: string, fallbackEmail?: string): string | null {
  const explicit = process.env.RESEND_FROM?.trim();
  if (explicit) return explicit;
  if (fallbackEmail) {
    return fallbackName ? `${fallbackName} <${fallbackEmail}>` : fallbackEmail;
  }
  return process.env.REPORT_FROM_EMAIL?.trim() || null;
}

export type ResendEmail = {
  to: string;
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
  /** ISO instant to deliver at. Resend holds the mail until then. */
  scheduledAt?: string;
};

/** Sends one email. Throws on a Resend-reported error so callers can log it. */
export async function sendTransactionalEmail(
  apiKey: string,
  email: ResendEmail,
): Promise<{ id: string | null }> {
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: email.from,
    to: [email.to],
    subject: email.subject,
    html: email.html,
    ...(email.replyTo ? { replyTo: email.replyTo } : {}),
    ...(email.scheduledAt ? { scheduledAt: email.scheduledAt } : {}),
  });
  if (error) {
    throw new Error(`${error.name ?? "resend error"}: ${error.message ?? "unknown"}`);
  }
  return { id: data?.id ?? null };
}

/**
 * Cancels a scheduled email that has not gone out yet. Used when a webinar
 * moves and its already-queued reminders would otherwise arrive at the old
 * time.
 *
 * Never throws. Besides a reminder that already went out, Resend answers
 * "Email is not scheduled" for a short window right after scheduling, while
 * the record is still `queued` and has not settled into `scheduled` — so a
 * failure here is not proof the mail will be delivered, and the caller treats
 * it as advisory rather than fatal.
 */
export async function cancelScheduledEmail(apiKey: string, id: string): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const { error } = await new Resend(apiKey).emails.cancel(id);
    if (error) {
      console.warn(`[resend] could not cancel ${id}: ${error.message ?? "unknown"}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[resend] cancel ${id} threw:`, e);
    return false;
  }
}
