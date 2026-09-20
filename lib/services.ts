export type Service = {
  index: string;
  title: string;
  /** Capability name used in the home About card and the footer. Separate from
   *  `title`, which also drives the Services page and its deep-link slugs. */
  label: string;
  short: string;
  body: string;
  deliverables: string[];
  stack: string[];
  duration: string;
};

/** Stable identifier derived from a service's title, e.g. "Web & Software
 *  Development" -> "web-software-development" — used as the accordion
 *  row's id/data-service and as the fragment other pages deep-link with,
 *  so it doesn't depend on array order or React's own useId() output. */
export function serviceSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const services: Service[] = [
  {
    index: "01",
    title: "Web & Software Development",
    label: "Websites & Digital Products",
    short: "Business-critical platforms, built to convert and built to last.",
    body:
      "Modern business websites, high-conversion B2B platforms, e-commerce engines, and bespoke custom web applications — engineered around the workflows the enterprise already runs on, not the other way around.",
    deliverables: [
      "Marketing & product website builds",
      "B2B platform and portal development",
      "E-commerce storefronts and checkout flows",
      "Custom web application architecture",
      "Performance and SEO baseline",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "React"],
    duration: "4–8 weeks",
  },
  {
    index: "02",
    title: "Business Systems & Automation",
    label: "Business Systems & Automation",
    short: "The manual work your team shouldn't still be doing by hand.",
    body:
      "End-to-end workflow automation, custom backend databases, internal administrative dashboards, and third-party API integrations — built to remove the busywork between your systems, not add another one.",
    deliverables: [
      "Workflow automation & process mapping",
      "Custom database architecture",
      "Internal admin dashboards",
      "Third-party API integrations",
      "Ongoing systems maintenance",
    ],
    stack: ["Python", "Node.js", "REST APIs", "PostgreSQL"],
    duration: "3–6 weeks",
  },
  {
    index: "03",
    title: "Data Science & Analytics",
    label: "Data & Analytics",
    short: "Decisions made from evidence, not instinct.",
    body:
      "Business intelligence dashboards, data cleaning pipelines, customer and sales analytics, and predictive modelling — turning whatever your systems already collect into decisions you can act on.",
    deliverables: [
      "BI dashboards & reporting",
      "Data cleaning & pipeline builds",
      "Customer and sales analytics",
      "Predictive modelling",
      "Data source integration",
    ],
    stack: ["Python", "SQL", "Data Viz", "Predictive"],
    duration: "3–6 weeks",
  },
  {
    index: "04",
    title: "AI & Intelligent Solutions",
    label: "AI & Intelligent Workflows",
    short: "AI that does the work, not just the demo.",
    body:
      "Tailored AI assistants, document intelligence systems, automated lead qualification, and intelligent workflow automation — built on production-grade architecture, not a prompt bolted onto your site.",
    deliverables: [
      "Custom AI assistants",
      "Document intelligence systems",
      "Automated lead qualification",
      "LLM-powered workflow automation",
      "Vector search & retrieval infrastructure",
    ],
    stack: ["Claude API", "OpenAI", "LLM Architecture", "Vector DB"],
    duration: "4–8 weeks",
  },
];

export const principles = [
  {
    index: "01",
    title: "Systems Over Static Shells",
    body: "A web application should never be a dead-end visual brochure. We architect every build on modular backends, clean APIs, and structured data—built from day one to integrate future automation and AI capabilities.",
  },
  {
    index: "02",
    title: "Continuity After Handover",
    body: "Shipping is where the real lifecycle of a digital system begins. We don't deliver code and disappear; we remain embedded alongside our clients to support, optimize, and grow their infrastructure as operations scale.",
  },
  {
    index: "03",
    title: "Utility Before Ornament",
    body: "High-end design is meaningless if it doesn't solve an operational bottleneck. We prioritize intuitive workflows, clean data collection, and process automation that save hours of manual effort and drive real sales.",
  },
  {
    index: "04",
    title: "Depth Over Volume",
    body: "We intentionally constrain the number of active engagements we take each year. This guarantees direct, hands-on engineering attention from senior practitioners without agency bloat or diluted execution.",
  },
];

export const process = [
  {
    index: "01",
    title: "Discovery & System Architecture",
    body: "We audit your existing workflows, map data schemas, and define system boundaries. Before writing production code, we deliver a concrete architectural blueprint with explicit milestone exit conditions and zero fluff.",
  },
  {
    index: "02",
    title: "Dual-Track Execution",
    body: "Interface engineering and backend infrastructure run in parallel. Instead of waiting weeks for static comps, you interact with working code in a live preview staging environment early in the cycle.",
  },
  {
    index: "03",
    title: "Hardening & Deployment",
    body: "Backend APIs, third-party services, data pipelines, and automation flows are fully integrated and stress-tested. We execute security audits, performance tuning, and a seamless production deployment.",
  },
  {
    index: "04",
    title: "Autonomous Handover & Evolution",
    body: "We deliver complete repository ownership, clean documentation, and hands-on team walkthroughs. We leave a system your team can operate independently, while remaining embedded for high-level scaling and feature expansion.",
  },
];

/**
 * The About page's own process breakdown — deliberately separate from
 * `process` above, which /services still uses for its own "Every engagement
 * runs the same four phases" section. Updating the shared array instead
 * would have silently changed that page's content too.
 */
export const aboutProcess = [
  {
    index: "01",
    title: "Discovery & Architecture",
    body: "We audit your existing workflows, data structures, and operational bottlenecks. Before writing code, we map out the system requirements—defining schema design, API boundaries, and clear business outcomes.",
  },
  {
    index: "02",
    title: "Dual-Track Engineering",
    body: "Interface design and full-stack development run together. Instead of waiting weeks for static design comps, you interact with functional code in a live preview environment early in the build cycle.",
  },
  {
    index: "03",
    title: "Integration & Launch",
    body: "We connect backend APIs, third-party services, payment pipelines, and automated workflows. After security checks and performance tuning, we execute a seamless production deployment.",
  },
  {
    index: "04",
    title: "Embedded Evolution",
    body: "Launch is the start of the system lifecycle, not the end. We stay embedded to maintain uptime, optimize performance, and continuously expand your stack into custom web apps, analytics, and AI as you scale.",
  },
];
