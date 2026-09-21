export type Service = {
  index: string;
  title: string;
  /** Public display name — what every surface renders. Separate from
   *  `title`, which is the stable key `serviceSlug()` derives the accordion
   *  anchor and the home card's deep link from, and so must not change. */
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
    short: "Websites and digital products designed to make the business clearer, easier to use and easier to grow.",
    body:
      "From focused business websites to customer portals, e-commerce experiences and custom web applications, we design and build around the way the business actually operates. The goal is a digital experience that works well for customers and remains useful as the business evolves.",
    deliverables: [
      "Business and product websites",
      "Customer portals and digital platforms",
      "E-commerce experiences",
      "Custom web applications",
      "Performance and SEO foundations",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "React"],
    duration: "4–8 weeks",
  },
  {
    index: "02",
    title: "Business Systems & Automation",
    label: "Business Systems & Automation",
    short: "Less manual work. Better-connected operations.",
    body:
      "We design internal systems and automated workflows around the tasks your team handles repeatedly. That can mean connecting tools, reducing duplicate work, improving handoffs or building a focused internal system where existing software no longer fits the way the business operates.",
    deliverables: [
      "Workflow automation",
      "Internal tools and dashboards",
      "CRM and operational integrations",
      "Booking, enquiry and approval flows",
      "Process and system improvements",
    ],
    stack: ["Python", "Node.js", "REST APIs", "PostgreSQL"],
    duration: "3–6 weeks",
  },
  {
    index: "03",
    title: "Data Science & Analytics",
    label: "Data & Analytics",
    short: "Turn business data into information people can actually use.",
    body:
      "We help businesses organise, connect and interpret the data they already generate so teams can see what is happening more clearly. Depending on the need, that can mean dashboards, reporting systems, data pipelines or deeper analysis designed around real operational and commercial questions.",
    deliverables: [
      "Dashboards and reporting",
      "Data cleaning and integration",
      "Operational and commercial analysis",
      "Automated reporting workflows",
      "Data pipelines and structured datasets",
    ],
    stack: ["Python", "SQL", "Data Viz", "Predictive Modeling"],
    duration: "3–6 weeks",
  },
  {
    index: "04",
    title: "AI & Intelligent Solutions",
    label: "AI & Intelligent Workflows",
    short: "Use AI where it removes real work or improves a real decision.",
    body:
      "We design intelligent workflows around clear business use cases, from assisting teams with repetitive knowledge work to connecting AI with existing systems, data and processes. The goal is practical utility, not adding AI where ordinary software would do the job better.",
    deliverables: [
      "AI-assisted workflows",
      "Knowledge and document systems",
      "Internal copilots and support tools",
      "AI integrations with existing systems",
      "Process automation with human oversight",
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
    title: "Understand the Need",
    body: "We begin with the business problem, the people involved and the current way things work. This gives us the context to decide what should be improved, replaced or built.",
  },
  {
    index: "02",
    title: "Define the Direction",
    body: "We shape the right approach across experience, system structure and technical execution, keeping the solution proportionate to the actual problem.",
  },
  {
    index: "03",
    title: "Build & Validate",
    body: "We develop the solution in working stages, test the important flows and integrations, and refine what needs attention before release.",
  },
  {
    index: "04",
    title: "Launch & Support",
    body: "We prepare the final release, document what matters and support the system after launch where ongoing improvement or maintenance makes sense.",
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
    title: "Understand the Problem",
    body: "We start with the business, the audience and the current way things work. We identify what is getting in the way, what matters most, and what the project actually needs before deciding how to build it.",
  },
  {
    index: "02",
    title: "Shape the Solution",
    body: "We turn what we learn into a clear direction for the experience, system and technical approach. Design and development can move together where it makes sense, with working previews used early to test the decisions being made.",
  },
  {
    index: "03",
    title: "Build & Launch",
    body: "We build the approved solution, connect the services it actually needs, test the experience across devices and workflows, and prepare it carefully for release. Launch happens only when the important details are working as intended.",
  },
  {
    index: "04",
    title: "Support & Evolve",
    body: "After launch, we can continue supporting the system as the business changes. Improvements, new workflows and deeper capabilities are added when there is a clear reason for them, not simply because more technology is available.",
  },
];
