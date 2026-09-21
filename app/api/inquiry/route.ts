import { Configuration, SendApi } from "hostinger-mail-api-sdk";
import {
  MAX_BODY_BYTES,
  inquiryHtml,
  inquirySubject,
  inquiryText,
  isHoneypotTripped,
  validateInquiry,
  type InquiryInput,
} from "@/lib/inquiry";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Contact inquiries.
 *
 * Email only for now: validate, then send through the Hostinger-managed
 * mailbox. When inquiries are stored as well, the insert goes between those
 * two steps — marked below — and nothing else in this file needs to move.
 *
 * Only POST is exported, so Next answers anything else with 405 on its own.
 */

/**
 * Never prerender or cache this. The route reads request headers and talks to
 * a third party; a cached response would be actively wrong.
 */
export const dynamic = "force-dynamic";

type Failure = "validation_error" | "submission_failed" | "rate_limited";

const ok = () => Response.json({ success: true });

const fail = (error: Failure, message: string, status: number, headers?: HeadersInit) =>
  Response.json({ success: false, error, message }, { status, headers });

export async function POST(request: Request) {
  // ---- 1. Size, before parsing --------------------------------------------
  // Content-Length is a hint, so the real body is measured below too; this
  // just rejects an obviously oversized request without reading it.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return fail("validation_error", "That submission is too large.", 413);
  }

  // ---- 2. Rate limit ------------------------------------------------------
  // Before the body is read: a flood should cost as little as possible. See
  // lib/rateLimit.ts for what this does and does not protect against.
  const limit = checkRateLimit(clientKey(request.headers));
  if (!limit.allowed) {
    return fail(
      "rate_limited",
      "Too many submissions. Please try again shortly, or email us directly.",
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  // ---- 3. Parse -----------------------------------------------------------
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail("validation_error", "That submission could not be read.", 400);
  }
  if (raw.length > MAX_BODY_BYTES) {
    return fail("validation_error", "That submission is too large.", 413);
  }

  let input: InquiryInput;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fail("validation_error", "That submission was malformed.", 400);
    }
    input = parsed as InquiryInput;
  } catch {
    return fail("validation_error", "That submission was malformed.", 400);
  }

  // ---- 4. Honeypot --------------------------------------------------------
  // Answer exactly as a success does. A bot that can tell the difference
  // learns to avoid the trap; there is nothing to gain by telling it.
  if (isHoneypotTripped(input)) return ok();

  // ---- 5. Validate --------------------------------------------------------
  const result = validateInquiry(input);
  if (!result.ok) return fail("validation_error", result.message, 400);
  const inquiry = result.inquiry;

  // ---- 6. FUTURE: store the inquiry here ----------------------------------
  // await storeInquiry(inquiry);
  // It belongs on this line specifically: after validation, before the send,
  // so a record exists even if the mail provider is having a bad day.

  // ---- 7. Send ------------------------------------------------------------
  const token = process.env.HOSTINGER_MAIL_API_TOKEN;
  const mailboxId = process.env.HOSTINGER_MAILBOX_ID;
  const to = process.env.INQUIRY_TO_EMAIL;

  if (!token || !mailboxId || !to) {
    // A configuration problem, not the visitor's. Say so in the log, where the
    // people who can fix it will look, and keep the public answer generic.
    // Only the names are logged — never a value.
    console.error(
      "[inquiry] missing configuration:",
      [
        !token && "HOSTINGER_MAIL_API_TOKEN",
        !mailboxId && "HOSTINGER_MAILBOX_ID",
        !to && "INQUIRY_TO_EMAIL",
      ]
        .filter(Boolean)
        .join(", "),
    );
    return fail("submission_failed", "We could not send that just now.", 500);
  }

  try {
    // The sender is the managed mailbox itself — the token authorises that one
    // mailbox, and the API takes no `from`. There is also no Reply-To field in
    // the payload, so the visitor's address is carried in the body, both as a
    // field and as a one-click mailto link; see lib/inquiry.ts. `displayName`
    // puts their name in the From line so the inbox still reads at a glance.
    const send = new SendApi(new Configuration({ accessToken: token }));
    await send.sendEmail(mailboxId, {
      to: [to],
      displayName: `${inquiry.name} via riemlabs.dev`,
      subject: inquirySubject(inquiry),
      text: inquiryText(inquiry),
      html: inquiryHtml(inquiry),
    } as Parameters<SendApi["sendEmail"]>[1]);
  } catch (cause) {
    // The provider's own error can name mailboxes, tokens and internals, so it
    // goes to the server log and never to the browser.
    console.error("[inquiry] hostinger rejected the send:", cause);
    return fail("submission_failed", "We could not send that just now.", 502);
  }

  return ok();
}
