"use client";

import { useState } from "react";
import BracketLink from "@/components/BracketLink";
import { site } from "@/lib/site";

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

function Legend({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <legend className="meta flex items-baseline gap-2 pb-6">
      <span className="tnum text-accent">{index}</span>
      <span className="text-ink/25">/</span>
      <span>{children}</span>
    </legend>
  );
}

export default function ContactForm() {
  const [scope, setScope] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);

  const toggleScope = (item: string) =>
    setScope((current) =>
      current.includes(item) ? current.filter((s) => s !== item) : [...current, item],
    );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    setInvalid([]);

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      message: String(data.get("message") ?? ""),
      scope,
      timeline,
    };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: string[];
      };

      if (!response.ok || !result.ok) {
        setInvalid(result.fields ?? []);
        setError(result.error ?? "Something went wrong. Please email us directly.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Network error. Please email us directly.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-hairline p-10 lg:p-16">
        <p className="meta flex items-center gap-2 text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          Brief received
        </p>
        <h3 className="mt-8 text-headline font-medium">Thank you — that&apos;s in.</h3>
        <p className="mt-6 max-w-md text-lede text-ink/55">
          We read every brief ourselves and reply within 24 hours, even when the answer is no.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <BracketLink href="/work" variant="framed">
            Browse the work
          </BracketLink>
          <a
            href={`mailto:${site.email}`}
            className="meta text-ink/45 transition-colors duration-400 ease-expo hover:text-accent"
          >
            {site.email}
          </a>
        </div>
      </div>
    );
  }

  const flagged = (field: string) => invalid.includes(field);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-20">
      {/* 01 — Who */}
      <fieldset className="border-t border-hairline pt-8">
        <Legend index="01">About you</Legend>

        <div className="grid gap-x-gutter gap-y-10 md:grid-cols-2">
          <label className="block">
            <span className="meta text-ink/40">Name *</span>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={flagged("name")}
              className={`${fieldClass} mt-4 ${flagged("name") ? "border-accent" : ""}`}
            />
          </label>

          <label className="block">
            <span className="meta text-ink/40">Email *</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={flagged("email")}
              className={`${fieldClass} mt-4 ${flagged("email") ? "border-accent" : ""}`}
            />
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
        <Legend index="02">Scope * — select all that apply</Legend>

        <div className="flex flex-wrap gap-3">
          {SCOPES.map((option) => {
            const active = scope.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleScope(option)}
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
        <Legend index="04">The brief *</Legend>

        <label className="block">
          <span className="meta text-ink/40">
            Tell us what you’re trying to improve, build or solve.
          </span>
          <textarea
            name="message"
            required
            rows={6}
            minLength={20}
            placeholder="Twenty words is plenty to start."
            aria-invalid={flagged("message")}
            className={`${fieldClass} mt-4 resize-y leading-relaxed ${flagged("message") ? "border-accent" : ""}`}
          />
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
    </form>
  );
}
