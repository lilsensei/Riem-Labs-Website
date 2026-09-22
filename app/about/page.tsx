import type { Metadata } from "next";
import CTABanner from "@/components/CTABanner";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import GlyphPanel from "@/components/GlyphPanel";
import JsonLd from "@/components/JsonLd";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import SectionHeader from "@/components/SectionHeader";
import { Fade, RevealLines } from "@/components/RevealText";
import { CHOREO_OFFSETS, choreographyPool } from "@/lib/glyphChoreographies";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { aboutProcess, principles } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "Studio",
  description:
    "Learn how Riem Labs approaches digital presence, software and business systems by starting with how the business actually works.",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema("Studio", "/about")} />

      <PageIntro
        index="02"
        label="Studio"
        lines={["Built around how", "the business", "actually works."]}
        lede="Riem Labs is a Nairobi-based digital practice working across websites, digital products and business systems. We start by understanding the business, then shape the right combination of design, software and operational tooling around what it actually needs."
        showClock={false}
        meta={[
          { label: "Founded", value: `${site.founded} — ${site.city}` },
          { label: "Practice", value: "Independent" },
          { label: "Focus", value: "Digital presence & systems" },
          { label: "Availability", value: "Open for select projects" },
        ]}
      />

      {/* ── 02.1 / Story ───────────────────────────────────────────── */}
      <RevealSection className="bg-canvas">
        <div className="shell py-section">
          <SectionHeader index="01" label="Story" aside={<span>Why we exist</span>} />

          <div className="mt-16 grid gap-x-gutter gap-y-12 md:grid-cols-12">
            <RevealLines
              as="h2"
              lines={["Businesses grow.", "Their digital systems", "often don’t grow", "with them."]}
              className="text-headline font-medium md:col-span-6"
            />

            <div className="space-y-6 text-base leading-relaxed text-ink/60 md:col-span-5 md:col-start-8">
              <Fade as="p">
                {site.name} exists for the point where a business has moved forward but its
                digital presence, workflows or internal systems have not kept pace. What starts
                as a website problem can reveal something deeper: disconnected tools, manual
                processes, weak customer journeys or information that is difficult to use.
              </Fade>
              <Fade as="p">
                We work from the business problem outward. Sometimes the right answer is a
                better website. Sometimes it is software, automation, analytics or a more
                connected internal system. The goal is not to add complexity, but to build what
                the business actually needs next.
              </Fade>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── 02.2 / Principles ──────────────────────────────────────── */}
      <RevealSection className="bg-bone">
        {/* This section and 03 below share a background, so their two full
            section paddings met as one 335px band of empty cream. Both sides
            of that seam are trimmed; nothing inside either section changes. */}
        <div className="shell py-section pb-[clamp(3.5rem,7.5vw,7.5rem)]">
          <SectionHeader
            index="02"
            label="Operating Principles"
            wideSupport
            lines={["Principles that shape", "how we work, not just", "how we present ourselves."]}
            description="These principles guide how we make decisions, structure engagements and build for what the business actually needs. They are practical working standards, not statements added for appearance."
          />

          <div className="mt-20 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {principles.map((p, i) => (
              <GlyphPanel
                key={p.index}
                choreography={choreographyPool[CHOREO_OFFSETS.aboutPrinciples + i]}
                color="black"
                className="bg-canvas p-8 transition-colors duration-600 ease-expo hover:bg-bone lg:p-12"
              >
                <h3 className="mt-8 text-title font-medium">{p.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/55">{p.body}</p>
              </GlyphPanel>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── 02.3 / In Practice ─────────────────────────────────────── */}
      <RevealSection className="bg-bone">
        <div className="shell py-section pt-[clamp(3.5rem,7.5vw,7.5rem)]">
          <SectionHeader
            index="03"
            label="In Practice"
            wideSupport
            lines={["Built through real work,", "one engagement at a time."]}
            description="Riem Labs is still early in its story. Rather than manufacture a long company history, this section records the work, capabilities and operating patterns being built through real engagements in 2026."
          />

          <div className="mt-20">
            <ExperienceTimeline />
          </div>
        </div>
      </RevealSection>

      {/* ── 02.4 / Process ─────────────────────────────────────────── */}
      <RevealSection className="bg-canvas">
        <div className="shell py-section pb-[clamp(3.5rem,5.5vw,5.5rem)]">
          <SectionHeader
            index="04"
            label="Process"
            wideSupport
            lines={["A clear process, shaped", "around the problem", "at hand."]}
            description="We keep the process visible from the start, with clear decisions, working previews and direct communication throughout. The exact path depends on the project, but the principle stays the same: understand first, build deliberately, and evolve only where it adds real value."
          />

          {/* 2x2 on a tablet, four across only once there is real room.
              These four carry full paragraphs, so they need more width per
              column than ApproachStrip's one-line taglines do: at 1024 four
              columns gave each body 155px and a 203x449 card — more than twice
              as tall as it was wide, every line two or three words. 2x2 holds
              a ~300px measure through the whole iPad range instead. */}
          <div className="mt-20 grid gap-x-gutter gap-y-14 md:grid-cols-2 xl:grid-cols-4">
            {aboutProcess.map((step, i) => (
              <GlyphPanel
                key={step.index}
                choreography={choreographyPool[CHOREO_OFFSETS.aboutProcess + i]}
                color="black"
                glyphClassName="h-9 w-9"
                className="border-t border-hairline bg-canvas p-6 transition-colors duration-600 ease-expo hover:bg-bone"
              >
                <h3 className="mt-6 text-title font-medium">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/55">{step.body}</p>
              </GlyphPanel>
            ))}
          </div>
        </div>
      </RevealSection>

      <CTABanner
        index="05"
        label="Contact"
        lines={["Bring us the problem.", "We’ll help define", "what comes next."]}
        note="Whether you need a stronger digital presence, a better customer journey or a more capable internal system, start with what the business needs to solve. We’ll help shape the right next step from there."
        cta="Start a conversation"
      />
    </>
  );
}
