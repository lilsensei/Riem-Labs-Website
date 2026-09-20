/**
 * What the client does, not what we built. It is the one descriptor the work
 * rows carry beside the name, so it reads as a sector rather than a taxonomy
 * of our own deliverables.
 */
export type ProjectCategory = string;

export type Project = {
  slug: string;
  index: string;
  title: string;
  client: string;
  year: string;
  category: ProjectCategory;
  summary: string;
  role: string[];
  stack: string[];
  /** Real homepage screenshot, in public/work/ — path, not a static import,
   *  since these are only ever rendered with next/image's `fill` mode into
   *  a fixed-aspect-ratio box, so no build-time width/height is needed. */
  image: string;
  /** Deployed site — external, opened in a new tab from the card. */
  href: string;
  featured: boolean;
  /** "template" until a project is adopted as a real business's actual live
   *  site, at which point it flips to "live" — same badge treatment either
   *  way, just the word. */
  status: "template" | "live";
};

/**
 * The public index. A project is listed here only while it is meant to be
 * publicly visible; removing an entry removes it from the Work page, the
 * home page's featured list and the category counts in one move, because
 * all three derive from this array.
 */
export const projects: Project[] = [
  {
    slug: "oracle-chemicals",
    index: "01",
    title: "Oracle Chemicals",
    client: "Chemical Distributor",
    year: "2026",
    category: "Chemical Distributor",
    summary:
      "A distribution catalogue built for people who arrive knowing exactly what they need. Product data, safety documentation and enquiry routing in one structure a small team can keep current.",
    role: ["Web systems", "Design system", "Front-end"],
    stack: ["Next.js", "TypeScript", "Tailwind"],
    image: "/work/oracle-chemicals.jpg",
    href: "https://oraclechemicals.netlify.app",
    featured: true,
    status: "template",
  },
  {
    slug: "elfi-dental-care",
    index: "02",
    title: "Elfi Dental Care",
    client: "Dental Clinic",
    year: "2026",
    category: "Dental Clinic",
    summary:
      "A clinic site that answers the questions a prospective patient actually has — what it costs, how long it takes, who is doing it — and turns the answer into a booking.",
    role: ["Visual direction", "Web systems", "Front-end"],
    stack: ["Next.js", "Tailwind", "Sanity"],
    image: "/work/elfi-dental-care.jpg",
    href: "https://elfidentalcare.netlify.app",
    featured: true,
    status: "template",
  },
  {
    slug: "the-clicq",
    index: "03",
    title: "THE CLICQ",
    client: "Marketing & Communications",
    year: "2026",
    category: "Marketing & Communications",
    summary:
      "A studio site for a studio — the hardest brief there is. Case work in front, capability behind it, and a system their own team extends without calling us.",
    role: ["Design system", "Web systems", "Front-end"],
    stack: ["Next.js", "TypeScript", "GSAP", "Lenis"],
    image: "/work/the-clicq.jpg",
    href: "https://clicq.netlify.app",
    featured: true,
    status: "live",
  },
];

export const categories: ProjectCategory[] = [...new Set(projects.map((p) => p.category))];

export const featuredProjects = projects.filter((p) => p.featured);
