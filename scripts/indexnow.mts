import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "../lib/site.ts";

/**
 * IndexNow submission.
 *
 * Run it by hand after a production change that adds, removes or meaningfully
 * rewrites a page:
 *
 *   npm run indexnow                      — all eight public pages
 *   npm run indexnow -- /about /services  — only those
 *   npm run indexnow -- --dry-run         — validate and print, submit nothing
 *
 * Deliberately a command and not a hook. Nothing on the site calls this: not a
 * page render, not middleware, not server start. IndexNow is a "this changed"
 * signal, and a signal sent on every request is noise — the search engines
 * rate-limit it as such.
 *
 * No SDK. The protocol is one JSON POST, and a dependency to build that object
 * would be more code to trust than the object itself.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * The public pages, mirroring the list in `app/sitemap.ts`.
 *
 * Kept as its own list rather than imported from there: that module resolves
 * `@/lib/site` through Next's path alias, which this plain Node script has no
 * way to follow. If a page is ever added or removed, both lists move together
 * — the sitemap is the one a crawler reads, so it is the one to match.
 *
 * Everything not a page is absent on purpose: /api/inquiry is a POST endpoint,
 * /robots.txt and /sitemap.xml are instructions to crawlers rather than
 * destinations, and the two image routes are assets. Submitting any of them
 * asks an index to hold something that was never a page.
 */
const PUBLIC_PATHS = [
  "",
  "/about",
  "/work",
  "/services",
  "/contact",
  "/terms",
  "/privacy",
  "/refund",
] as const;

/** `riemlabs.dev` — the bare host, which is what IndexNow's `host` field takes. */
const HOST = new URL(site.url).host;

function fail(message: string): never {
  console.error(`indexnow: ${message}`);
  process.exit(1);
}

/**
 * Finds the key by reading the file that publishes it, rather than holding a
 * second copy here.
 *
 * The protocol's own rule is that `<key>.txt` at the site root contains
 * exactly `<key>`, so checking the name against the contents is both how the
 * key is discovered and a check that what we are about to claim is really
 * what a search engine will fetch.
 */
function readKey(): string {
  const dir = join(import.meta.dirname, "..", "public");
  const candidates = readdirSync(dir).filter((f) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(f));

  if (candidates.length === 0) fail(`no IndexNow key file found in ${dir}`);
  if (candidates.length > 1) {
    fail(`several key files in public/ (${candidates.join(", ")}) — there must be exactly one`);
  }

  const file = candidates[0];
  const key = file.replace(/\.txt$/, "");
  const contents = readFileSync(join(dir, file), "utf8");

  if (contents !== key) {
    fail(`public/${file} must contain exactly "${key}", but holds ${JSON.stringify(contents)}`);
  }
  return key;
}

/**
 * Turns an argument into one of the known public URLs, or refuses it.
 *
 * Accepts a path (`/about`) or the full canonical URL. Anything else — another
 * host, a fragment, a query, a route that is not a page — is rejected by name
 * rather than quietly dropped, because a silent drop looks identical to a
 * successful submission.
 */
function resolveArg(arg: string): string {
  let path: string;

  if (arg.startsWith("http://") || arg.startsWith("https://")) {
    let url: URL;
    try {
      url = new URL(arg);
    } catch {
      fail(`"${arg}" is not a URL`);
    }
    if (url.host !== HOST) fail(`"${arg}" is not on ${HOST}`);
    if (url.hash) fail(`"${arg}" has a fragment — a fragment is a position in a page, not a page`);
    if (url.search) fail(`"${arg}" has a query string; only canonical URLs are submitted`);
    path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
  } else {
    if (arg.includes("#")) fail(`"${arg}" has a fragment — a fragment is a position in a page, not a page`);
    if (arg.includes("?")) fail(`"${arg}" has a query string; only canonical URLs are submitted`);
    if (!arg.startsWith("/")) fail(`"${arg}" is not a path — write it as /about`);
    path = arg === "/" ? "" : arg.replace(/\/$/, "");
  }

  if (!(PUBLIC_PATHS as readonly string[]).includes(path)) {
    fail(
      `"${arg}" is not one of the public pages.\n          submittable: ` +
        PUBLIC_PATHS.map((p) => p || "/").join(" "),
    );
  }
  return `${site.url}${path}`;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const paths = args.filter((a) => a !== "--dry-run");

  const urlList = paths.length
    ? [...new Set(paths.map(resolveArg))]
    : PUBLIC_PATHS.map((p) => `${site.url}${p}`);

  const key = readKey();
  const body = {
    host: HOST,
    key,
    keyLocation: `${site.url}/${key}.txt`,
    urlList,
  };

  console.log(`indexnow: ${urlList.length} URL${urlList.length === 1 ? "" : "s"} → ${ENDPOINT}`);
  console.log(`          key file ${body.keyLocation}`);
  for (const url of urlList) console.log(`          ${url}`);

  if (dryRun) {
    console.log("indexnow: dry run — nothing submitted");
    return;
  }

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    fail(`could not reach ${ENDPOINT} — ${(error as Error).message}`);
  }

  const text = (await response.text()).trim();

  /** What each documented status actually means, so a failure explains itself. */
  const MEANING: Record<number, string> = {
    200: "accepted",
    202: "accepted — key still being validated",
    400: "bad request: the submission was malformed",
    403: "forbidden: the key was not valid for this host",
    422: "unprocessable: a URL does not belong to this host, or the key does not match",
    429: "too many requests: slow down",
  };
  const meaning = MEANING[response.status] ?? "undocumented status";

  if (response.status !== 200 && response.status !== 202) {
    fail(`${response.status} ${meaning}${text ? ` — ${text}` : ""}`);
  }

  console.log(`indexnow: ${response.status} ${meaning}${text ? ` — ${text}` : ""}`);
}

await main();
