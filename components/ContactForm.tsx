"use client";

import { useEffect, useRef, useState } from "react";
import BracketLink from "@/components/BracketLink";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";

/**
 * Hash that means "you arrived here to brief something" — currently sent by
 * the work preview's "Brief a similar project". Landing on it puts the cursor
 * in the first field instead of at the top of a long form. A plain `/contact`
 * is unaffected.
 */
const BRIEF_HASH = "#brief";

const SCOPES = [
  "Websites & Digital Products",
  "Business Systems & Automation",
  "Data & Analytics",
  "AI & Intelligent Workflows",
  "Existing System Improvement",
  "Not sure yet",
];

const TIMELINES = [
  "As soon as possible",
  "Within 1 month",
  "1 — 3 months",
  "3 — 6 months",
  "6+ months",
  "Not sure yet",
];

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full border-b border-hairline bg-transparent pb-3 pt-2 text-lg outline-none transition-colors duration-400 ease-expo placeholder:text-ink/25 focus:border-accent";

function Legend({
  index,
  children,
  invalid = false,
}: {
  index: string;
  children: React.ReactNode;
  /** Turns the whole heading — star included — Riem blue after a failed submit. */
  invalid?: boolean;
}) {
  return (
    <legend className="meta flex items-baseline gap-2 pb-6">
      <span className="tnum text-accent">{index}</span>
      <span className="text-ink/25">/</span>
      <span className={invalid ? "text-accent" : undefined}>{children}</span>
    </legend>
  );
}

export default function ContactForm() {
  const { scrollTo } = useSmoothScroll();
  const [scope, setScope] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  /**
   * One message per invalid field, keyed by field name. Empty object means the
   * form is clean — this is also what decides whether a submit is attempted at
   * all, so an empty required field can never reach the network.
   */
  const [errors, setErrors] = useState<Record<string, string>>({});
  /**
   * In-flight lock. `status` cannot do this job: three clicks dispatched in one
   * task all read the same pre-update state and all get through. A ref is set
   * synchronously, so the second click sees it immediately.
   */
  const sending = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  /**
   * Arriving from a "Brief a similar project" link: bring the first fieldset
   * to rest under the header and put the cursor in Name, so the visitor can
   * start typing without hunting for the field.
   *
   * Deliberately mount-only, like the services deep link. The scroll waits a
   * frame so the section has laid out — measuring before that lands short —
   * and `scroll-mt` on the fieldset, not a magic number here, is what keeps it
   * clear of the fixed header. If the element is not there yet for any reason
   * the whole thing is a no-op and the page behaves as a normal /contact load.
   */
  useEffect(() => {
    if (window.location.hash !== BRIEF_HASH) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById("brief")?.scrollIntoView({ block: "start" });
      // preventScroll: the scrollIntoView above already chose the position,
      // and letting focus() pick its own would fight it.
      nameRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Hold the visitor at the success card.
   *
   * The card is far shorter than the form it replaces, so the page loses most
   * of its height the moment it renders and whatever scroll position the
   * browser was holding now points somewhere near the footer. Bringing the
   * card back into view is the whole fix; `center` rather than `start` so it
   * sits in the middle of the screen instead of under the fixed header, and
   * smooth so it reads as the page settling rather than a jump.
   */
  useEffect(() => {
    if (status !== "success") return;
    const el = successRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      // Lenis owns the scroll position, so a native smooth scrollIntoView is
      // simply ignored — it moves the document under Lenis and Lenis puts it
      // back. Centring the card by hand and handing the number to Lenis is the
      // only version that actually lands.
      const rect = el.getBoundingClientRect();
      const target = rect.top + window.scrollY - Math.max(0, (window.innerHeight - rect.height) / 2);
      scrollTo(Math.max(0, Math.round(target)));
    });
    return () => cancelAnimationFrame(frame);
  }, [status, scrollTo]);

  const toggleScope = (item: string) =>
    setScope((current) =>
      current.includes(item) ? current.filter((s) => s !== item) : [...current, item],
    );

  /** Clear one field's message as soon as the visitor addresses it. */
  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  /**
   * The required set is exactly the fields carrying a `*` in the UI — name,
   * email, scope and the brief. Timeline and company are optional and are not
   * checked here.
   */
  function validate(payload: {
    name: string;
    email: string;
    message: string;
    scope: string[];
  }) {
    const found: Record<string, string> = {};
    if (!payload.name.trim()) found.name = "Please enter your name.";
    if (!payload.email.trim()) found.email = "Please enter your email.";
    // Deliberately permissive: this is a "did you mean to type an address"
    // check, not an RFC 5322 implementation. The server will be the authority.
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim()))
      found.email = "Please enter a valid email.";
    if (payload.scope.length === 0) found.scope = "Please select at least one.";
    if (!payload.message.trim())
      found.message = "Please tell us what you’re trying to solve.";
    return found;
  }

  /** Order matters: the visitor is sent to the first one they will meet. */
  const FOCUS_ORDER: Array<[string, () => HTMLElement | null]> = [
    ["name", () => nameRef.current],
    ["email", () => emailRef.current],
    ["scope", () => scopeRef.current?.querySelector("button") ?? null],
    ["message", () => messageRef.current],
  ];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // A second submit while the first is in flight would send the brief twice.
    if (sending.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      message: String(data.get("message") ?? ""),
      scope,
      timeline,
      // Honeypot. Always empty for a real visitor; the server treats anything
      // here as a bot and answers exactly as it answers a success.
      website: String(data.get("website") ?? ""),
    };

    // Client validation first, and it short-circuits. Submitting an empty form
    // used to POST to an endpoint that does not exist yet and surface the
    // resulting failure as "Network error", which told the visitor their
    // connection was broken when the truth was that they had not filled the
    // form in. Nothing is sent until the required fields are actually there.
    const found = validate(payload);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setError(null);
      setStatus("idle");
      const first = FOCUS_ORDER.find((entry) => found[entry[0]]);
      const el = first ? first[1]() : null;
      if (el) {
        el.scrollIntoView({ block: "center" });
        // A frame later: scrollIntoView and focus() race otherwise, and the
        // field lands under the header.
        requestAnimationFrame(() => el.focus({ preventScroll: true }));
      }
      return;
    }

    sending.current = true;
    setStatus("submitting");
    setError(null);
    setErrors({});

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // A non-JSON body is itself a failure signal — a proxy error page, say.
      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
        message?: string;
      } | null;

      if (!response.ok || !result?.success) {
        // Rate limiting is the one failure whose own wording is more useful
        // than the generic line — it explains the wait. Everything else gets
        // the fallback, whose job is to hand the visitor a way through.
        setError(
          result?.error === "rate_limited" && result.message?.trim()
            ? result.message.trim()
            : "Network error. Please email us directly.",
        );
        setStatus("error");
        return;
      }

      // Clear the form as well as switching view: the success panel replaces
      // the fields, but this component keeps its own scope/timeline state and
      // would hand it back still filled if the visitor returns to the form.
      form.reset();
      setScope([]);
      setTimeline(null);
      setErrors({});
      setError(null);
      setStatus("success");
    } catch {
      setError("Network error. Please email us directly.");
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  if (status === "success") {
    return (
      <div ref={successRef} className="border border-hairline p-10 lg:p-16">
        <p className="meta flex items-center gap-2 text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          Brief received
        </p>
        <h3 className="mt-8 text-headline font-medium">Thank you. We&rsquo;ve got your brief.</h3>
        <p className="mt-6 max-w-md text-lede text-ink/55">
          We read every brief ourselves and reply within 24 hours.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <BracketLink href="/work" variant="framed">
            Browse the work
          </BracketLink>
        </div>
      </div>
    );
  }

  const flagged = (field: string) => Boolean(errors[field]);

  /** Inline message under a field, tied to it by aria-describedby. */
  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <span id={`${field}-error`} className="meta mt-3 block text-accent">
        {errors[field]}
      </span>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-20">
      {/* 01 — Who */}
      <fieldset
        id="brief"
        className="scroll-mt-[calc(var(--header-h)+2rem)] border-t border-hairline pt-8"
      >
        <Legend index="01">About you</Legend>

        <div className="grid gap-x-gutter gap-y-10 md:grid-cols-2">
          <label className="block">
            <span className={`meta ${flagged("name") ? "text-accent" : "text-ink/40"}`}>Name *</span>
            <input
              ref={nameRef}
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={flagged("name") || undefined}
              aria-describedby={flagged("name") ? "name-error" : undefined}
              onInput={() => clearError("name")}
              className={`${fieldClass} mt-4 ${flagged("name") ? "border-accent" : ""}`}
            />
            <FieldError field="name" />
          </label>

          <label className="block">
            <span className={`meta ${flagged("email") ? "text-accent" : "text-ink/40"}`}>Email *</span>
            <input
              ref={emailRef}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={flagged("email") || undefined}
              aria-describedby={flagged("email") ? "email-error" : undefined}
              onInput={() => clearError("email")}
              className={`${fieldClass} mt-4 ${flagged("email") ? "border-accent" : ""}`}
            />
            <FieldError field="email" />
          </label>

          <label className="block md:col-span-2">
            <span className="meta text-ink/40">Company or project</span>
            <input
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Optional"
              className={`${fieldClass} mt-4`}
            />
          </label>
        </div>
      </fieldset>

      {/* 02 — Scope */}
      <fieldset className="border-t border-hairline pt-8">
        <Legend index="02" invalid={flagged("scope")}>
          Scope * — select all that apply
        </Legend>

        <div
          ref={scopeRef}
          role="group"
          aria-invalid={flagged("scope") || undefined}
          aria-describedby={flagged("scope") ? "scope-error" : undefined}
          className="flex flex-wrap gap-3"
        >
          {SCOPES.map((option) => {
            const active = scope.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  toggleScope(option);
                  clearError("scope");
                }}
                aria-pressed={active}
                className={`meta group inline-flex items-baseline gap-1.5 border px-4 py-3 transition-colors duration-400 ease-expo ${
                  active
                    ? "border-accent text-accent"
                    : `${flagged("scope") ? "border-accent/40" : "border-hairline"} text-ink/60 hover:border-accent hover:text-accent`
                }`}
              >
                <span
                  aria-hidden="true"
                  className={active ? "text-accent" : "text-ink/20 group-hover:text-accent"}
                >
                  {active ? "×" : "+"}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        <FieldError field="scope" />
      </fieldset>

      {/* 03 — Timeline */}
      <fieldset className="border-t border-hairline pt-8">
        <Legend index="03">Timeline</Legend>

        <div className="flex flex-wrap gap-3">
          {TIMELINES.map((option) => {
            const active = timeline === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTimeline((current) => (current === option ? null : option))}
                aria-pressed={active}
                className={`meta border px-4 py-3 transition-colors duration-400 ease-expo ${
                  active
                    ? "border-accent text-accent"
                    : "border-hairline text-ink/60 hover:border-accent hover:text-accent"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 04 — Brief */}
      <fieldset className="border-t border-hairline pt-8">
        <Legend index="04" invalid={flagged("message")}>The brief *</Legend>

        <label className="block">
          <span className={`meta ${flagged("message") ? "text-accent" : "text-ink/40"}`}>
            Tell us what you’re trying to improve, build or solve.
          </span>
          <textarea
            ref={messageRef}
            name="message"
            required
            rows={6}
            placeholder="Twenty words is plenty to start."
            aria-invalid={flagged("message") || undefined}
            aria-describedby={flagged("message") ? "message-error" : undefined}
            onInput={() => clearError("message")}
            className={`${fieldClass} mt-4 resize-y leading-relaxed ${flagged("message") ? "border-accent" : ""}`}
          />
          <FieldError field="message" />
        </label>
      </fieldset>

      {/* Submit — no border-t/pt-8 here: the form's own space-y-20 already
          gives this the same rhythm every other section gets, and the line
          was purely decorative on top of that, not load-bearing spacing. */}
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div>
          <BracketLink
            type="submit"
            variant="solid"
            size="lg"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending…" : "Start the conversation"}
          </BracketLink>

          {error ? (
            <p role="alert" className="meta mt-5 text-accent">
              {error}
            </p>
          ) : null}
        </div>

        <p className="meta max-w-xs text-ink/35">We reply within 24 hours.</p>
      </div>

      {/*
        Honeypot. Last in the form, not first: it is absolutely positioned
        but still a sibling, so as the first child `space-y-20` handed the
        80px gap to the opening fieldset instead and pushed the whole
        sequence down, leaving `01 / About you` sitting below `Direct`
        beside it. Out of flow, the margin it now takes changes nothing.
        Not `type="hidden"` — plenty of bots skip those — but a real
        field moved out of reach: off-screen, no tab stop, hidden from assistive
        tech and with autofill switched off so a password manager never puts
        anything in it. Anyone who can see this is not using a browser.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </form>
  );
}
