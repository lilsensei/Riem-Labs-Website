import type { Metadata } from "next";
import CTABanner from "@/components/CTABanner";
import GlyphPanel from "@/components/GlyphPanel";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import SectionHeader from "@/components/SectionHeader";
import WorkGallery from "@/components/WorkGallery";
import { Fade } from "@/components/RevealText";
import { CHOREO_OFFSETS, choreographyPool } from "@/lib/glyphChoreographies";
import { industries, projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work from Riem Labs across websites, digital products and business systems, presented according to what each project actually is.",
};

export default function WorkPage() {
  const years = projects.map((p) => Number(p.year));
  const first = Math.min(...years);
  const last = Math.max(...years);
  const span = first === last ? `${first}` : `${first}–${last}`;

  return (
    <>
      <PageIntro
        index="03"
        label="Work"
        lines={["Selected work across", "websites, products", "and business systems."]}
        lede="A public record of how Riem approaches different problems through design, software and systems thinking. Each project is presented according to what it actually is, without overstating its status or outcome."
        showClock={false}
        meta={[
          { label: "Projects", value: `${projects.length} in the public index` },
          { label: "Year", value: span },
          { label: "Categories", value: `${industries.length} disciplines` },
          { label: "Status", value: "Mixed project types" },
        ]}
      />

      <RevealSection className="bg-canvas">
        {/* `py-section`, matching About and Services. With `pb-section` alone
            the Index rule began exactly where the masthead's padding ended, so
            the label read as part of the hero rather than the start of the
            next section. */}
        <div className="shell py-section">
          <SectionHeader index="01" label="Index" className="mb-10" />
          <WorkGallery />
        </div>
      </RevealSection>

      <RevealSection className="bg-bone">
        {/* Same tightened bottom used on About's Process → Contact seam: this
            section also runs straight into the black Contact CTA, and measured
            158px at 1920 before this — the exact figure About's Process→Contact
            gap started at. The Index→Engagement seam above stays untouched: two
            different-background content sections in sequence, not a run into
            the CTA, which is the same distinction About's Story→Principles
            seam draws by staying untouched too. */}
        <div className="shell py-section pb-[clamp(3.5rem,5.5vw,5.5rem)]">
          <SectionHeader
            index="02"
            label="Engagement"
            wideSupport
            lines={["Not every problem", "looks like a", "public-facing website."]}
            description="Some projects begin with a visible customer experience. Others start deeper inside the business, with a workflow, internal tool, data problem or system that needs to work better. Our public work shows only part of what we can build."
          />

          <div className="mt-16 grid gap-x-gutter gap-y-10 md:grid-cols-3">
            {[
              {
                index: "01",
                title: "Custom Systems & Internal Tools",
                body: "Portals, dashboards and operational software designed around the way the business actually works.",
              },
              {
                index: "02",
                title: "Ongoing Product & System Support",
                body: "Continued support after launch for improvements, new workflows and technical changes as the business evolves.",
              },
              {
                index: "03",
                title: "Existing System Improvement",
                body: "Reviewing and improving an existing website, product or internal system when the current setup has become difficult to maintain, use or extend.",
              },
            ].map((item, i) => (
              <GlyphPanel
                key={item.index}
                choreography={choreographyPool[CHOREO_OFFSETS.workEngagement + i]}
                glyphClassName="h-9 w-9"
                className="border-t border-hairline bg-canvas p-6 transition-colors duration-600 ease-expo hover:bg-bone"
              >
                <h3 className="mt-6 text-title font-medium">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/55">{item.body}</p>
              </GlyphPanel>
            ))}
          </div>

          <Fade as="p" className="meta mt-10 text-ink/35">
            Some engagements remain private by agreement.
          </Fade>
        </div>
      </RevealSection>

      <CTABanner
        index="03"
        label="Contact"
        lines={["Have a problem worth", "building around?", "Let’s talk."]}
        note="If the work here reflects the kind of thinking your business needs, tell us what you’re trying to improve, build or replace. We’ll start with the problem and work out the right next step from there."
        cta="Start a conversation"
      />
    </>
  );
}
