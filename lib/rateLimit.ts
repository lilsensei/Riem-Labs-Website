/**
 * A small fixed-window rate limit held in this process's memory.
 *
 * Its limitations are real and worth stating plainly rather than discovering
 * later: the counters live in one server instance, so anything that runs the
 * app as more than one instance — several containers, or a serverless platform
 * spinning up parallel lambdas — gives each its own counters and multiplies the
 * effective allowance. A cold start forgets everything. It is therefore a
 * brake on casual repeat submissions and accidental double-posts, not a defence
 * against a determined distributed flood.
 *
 * That is a deliberate trade. Making it robust means shared state — Redis,
 * Upstash, a database — which this pass explicitly excludes. When inquiries do
 * get a database, the same window can move there and this file becomes the
 * fallback.
 */

type Window = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // ten minutes
const MAX_PER_WINDOW = 5;
/** Stop the map growing without bound if the process runs for a long time. */
const MAX_TRACKED_KEYS = 5000;

const windows = new Map<string, Window>();

function sweep(now: number) {
  for (const [key, w] of windows) if (w.resetAt <= now) windows.delete(key);
  if (windows.size > MAX_TRACKED_KEYS) windows.clear();
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > MAX_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client identity.
 *
 * Forwarded headers are trivially spoofable, so this is not identity in any
 * security sense — it only has to be stable enough to catch the same browser
 * submitting repeatedly. Everything unattributable shares one bucket, which is
 * the conservative direction to fail in.
 */
export function clientKey(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded ? forwarded.split(",")[0]?.trim() : "";
  return first || headers.get("x-real-ip") || "unknown";
}
