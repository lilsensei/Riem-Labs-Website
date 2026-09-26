/**
 * The sector a project's client operates in — shown publicly as "Industry"
 * on the Work index rows and inside the project preview. Not a taxonomy of
 * our own deliverables.
 */
export type Industry = string;

export type Project = {
  slug: string;
  index: string;
  title: string;
  industry: Industry;
  year: string;
  /** One line for the index/preview intro. */
  summary: string;
  /** The business problem, in the client's terms — never phrased as a
   *  criticism of anything that existed before Riem. */
  problem: string;
  /** What Riem actually did about it. */
  solution: string;
  /** Public-facing deliverables — plain service names, not our internal
   *  role breakdown. "Web Design" / "Web Development" cover the great
   *  majority of what ships here; only add another term when the project
   *  genuinely called for it (UX/UI Design, Content Structure, CMS…). */
  deliverables: string[];
  /** Actual technologies used — never padded for appearance. */
  technology: string[];
  /** Real homepage screenshot, in public/work/ — path, not a static import,
   *  since these are only ever rendered with next/image's `fill` mode into
   *  a fixed-aspect-ratio box, so no build-time width/height is needed. */
  image: string;
  /** The deployed site, opened from the preview's primary CTA. Present only
   *  for a project the client has actually taken live — omitted, not just
   *  hidden, for a concept build, so there is no stray URL for a future
   *  change to accidentally surface as "Visit live site". */
  href?: string;
  featured: boolean;
  /** "concept" until a project is adopted as a real business's actual live
   *  site, at which point it flips to "live" — same distinction the old
   *  "template" label made, worded for a public reader rather than an
   *  internal one.
   *
   *  "coming-soon" is the state between the two: built and adopted, but not
   *  yet on its permanent hosting, so there is no address worth sending a
   *  visitor to. Such a project carries no `href`, which is what removes the
   *  "Visit live site" CTA. */
  status: "concept" | "coming-soon" | "live";
};

/**
 * What each status is called in public, in one place so the index card and the
 * preview panel cannot drift apart. `.micro` uppercases the card's copy, so
 * "Coming Soon" reads as "COMING SOON" there and in title case in the panel.
 */
export const STATUS_LABEL: Record<Project["status"], string> = {
  concept: "Concept",
  "coming-soon": "Coming Soon",
  live: "Live",
};

/**
 * The public index. A project is listed here only while it is meant to be
 * publicly visible; removing an entry removes it from the Work page, the
 * home page's featured list and the industry count in one move, because
 * all three derive from this array.
 */
export const projects: Project[] = [
  {
    slug: "the-clicq",
    index: "01",
    title: "THE CLICQ",
    industry: "Marketing & Communications",
    year: "2026",
    summary:
      "A studio site for a studio — the hardest brief there is. Case work in front, capability behind it, and a system their own team extends without calling us.",
    problem:
      "A communications studio needed a digital presence that could present its positioning, capabilities and work with the same clarity and confidence as the brands it represents.",
    solution:
      "Riem designed and built a focused studio website with a strong visual system, responsive experience and clear content structure for presenting the studio's work and capabilities.",
    deliverables: ["Web Design", "Web Development"],
    technology: ["Next.js", "TypeScript", "GSAP", "Lenis"],
    image: "/work/the-clicq.jpg",
    // No `href` while the status is "coming-soon": the build is only on a
    // temporary deployment, and that is not an address to hand the public.
    featured: true,
    status: "coming-soon",
  },
  {
    slug: "oracle-chemicals",
    index: "02",
    title: "Oracle Chemicals",
    industry: "Chemical Distribution",
    year: "2026",
    summary:
      "A distribution catalogue built for people who arrive knowing exactly what they need. Product data, safety documentation and enquiry routing in one structure a small team can keep current.",
    problem:
      "The business needed a clearer digital catalogue experience for professional buyers, with product information, technical documentation and enquiry paths easier to find and use.",
    solution:
      "Riem developed a concept for a structured B2B-facing website that brings product discovery, technical information and enquiry routing into one clearer digital experience.",
    deliverables: ["Web Design", "Web Development"],
    technology: ["Next.js", "TypeScript", "Tailwind"],
    image: "/work/oracle-chemicals.jpg",
    featured: true,
    status: "concept",
  },
  {
    slug: "elfi-dental-care",
    index: "03",
    title: "Elfi Dental Care",
    industry: "Dental Clinic",
    year: "2026",
    summary:
      "A clinic site that answers the questions a prospective patient actually has — what it costs, how long it takes, who is doing it — and turns the answer into a booking.",
    problem:
      "Patients need to understand essential clinic information quickly, including services, costs, practitioner context and how to book, without unnecessary friction.",
    solution:
      "Riem developed a concept for a clearer clinic website that organises essential patient information around a faster path from initial questions to booking.",
    deliverables: ["Web Design", "Web Development"],
    technology: ["Next.js", "Tailwind", "Sanity"],
    image: "/work/elfi-dental-care.jpg",
    featured: true,
    status: "concept",
  },
];

export const industries: Industry[] = [...new Set(projects.map((p) => p.industry))];

export const featuredProjects = projects.filter((p) => p.featured);
