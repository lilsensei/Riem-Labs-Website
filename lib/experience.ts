export type TimelineEntry = {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  /** Reserved for the accent dot + radar blip the timeline gives a standing
   *  entry. Unused while every entry shares one year — see the note below. */
  current?: boolean;
};

/**
 * The practice's own record, 2026 only.
 *
 * This deliberately does not derive from `projects`: the timeline is about
 * how the practice is being built, not a second rendering of the work index,
 * and tying the two together meant every change to the public project list
 * silently rewrote the studio's history.
 *
 * No entry is marked `current`. That flag exists to separate live work from
 * history, and with a single-year record there is nothing to separate — it
 * would only set five radar blips pinging at once. Restore it per entry once
 * there is a second year to distinguish from.
 */
export const experience: TimelineEntry[] = [
  {
    year: "2026",
    title: "Founded",
    subtitle: "Nairobi",
    description:
      "Riem Labs begins as an independent digital practice in Nairobi, focused on building digital presence and business systems around real operational needs.",
    tags: ["Founding"],
  },
  {
    year: "2026",
    title: "Selected Work",
    subtitle: "Websites & digital products",
    description:
      "Early projects establish the practice across websites, digital products and client-facing experiences, with each project documented according to its actual status.",
    tags: ["Web & Software Development"],
  },
  {
    year: "2026",
    title: "Systems & Automation",
    subtitle: "Workflows & internal tools",
    description:
      "The practice expands beyond presentation work into workflows, internal tools and automation where the business problem justifies it.",
    tags: ["Business Systems & Automation"],
  },
  {
    year: "2026",
    title: "Data & Intelligent Workflows",
    subtitle: "Analytics & AI",
    description:
      "Analytics and AI capabilities are developed as supporting tools, used selectively where they create clear operational value.",
    tags: ["Data Science & Analytics", "AI & Intelligent Solutions"],
  },
  {
    year: "2026",
    title: "Practice Development",
    subtitle: "Process & standards",
    description:
      "Riem continues refining its process, technical standards and long-term engagement model as real work accumulates.",
    tags: ["Process"],
  },
];
