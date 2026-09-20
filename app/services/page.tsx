import type { Metadata } from "next";
import CTABanner from "@/components/CTABanner";
import GlyphPanel from "@/components/GlyphPanel";
import LogoMarquee from "@/components/LogoMarquee";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import SectionHeader from "@/components/SectionHeader";
import ServiceAccordion from "@/components/ServiceAccordion";
import { CHOREO_OFFSETS, choreographyPool } from "@/lib/glyphChoreographies";
import { process, services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Websites & digital products, business systems & automation, data & analytics, and AI & intelligent workflows — the four ways Riem Labs helps businesses move from friction to better systems.",
};

const ENGAGEMENTS = [
  {
    index: "01",
    title: "Defined Project",
    tagline: "A clear scope, agreed milestones and focused delivery from start to launch.",
    fit: "New websites, digital products, internal tools, system improvements and clearly defined builds.",
  },
  {
    index: "02",
    title: "Ongoing Support",
    tagline: "Continued design and technical support for products or systems that need regular improvement after launch.",
    fit: "Teams that need steady iteration, new workflows, maintenance or continued product development without hiring full-time capacity.",
  },
  {
    index: "03",
    title: "System Review",
    tagline: "A focused review of an existing website, product or internal system to identify what is working, what is getting in the way and what should change next.",
    fit: "Outdated systems, difficult workflows, performance issues, technical debt or businesses deciding whether to improve, rebuild or replace an existing setup.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        index="04"
        label="Services"
        lines={["Four ways we help businesses", "move from friction", "to better systems."]}
        lede="From websites and digital products to internal systems, analytics and intelligent workflows, each service starts with the problem the business is actually trying to solve."
        showClock={false}
        meta={[
          { label: "Services", value: "4 core areas" },
          { label: "Engagement", value: "Project or ongoing support" },
          { label: "Handover", value: "Clear documentation" },
          { label: "Starting point", value: "Business problem first" },
        ]}
      />

      {/* ── 03.1 / Offerings ───────────────────────────────────────── */}
      <RevealSection className="bg-canvas">
        <div className="shell pb-section">
          <SectionHeader
            index="01"
            label="Offerings"
            aside={<span>Select to expand</span>}
            className="mb-14"
          />
          <ServiceAccordion services={services} />
        </div>
      </RevealSection>

      <LogoMarquee />

      {/* ── 03.2 / Engagement models ───────────────────────────────── */}
      <RevealSection className="bg-bone">
        {/* Engagement’s bottom and Process’s top met as one 356px band — the
            same doubled-padding seam About’s Principles → In Practice had at
            335px. Both sides take the same trim that one did. */}
        <div className="shell py-section pb-[clamp(3.5rem,7.5vw,7.5rem)]">
          <SectionHeader
            index="02"
            label="Engagement models"
            wideSupport
            lines={["Different problems need", "different ways of working."]}
            description="Some engagements are best handled as a defined project. Others need ongoing support or a focused review of an existing system. We choose the structure that fits the problem, scope and level of continuity required."
          />

          <div className="mt-20 grid gap-px border border-hairline bg-hairline lg:grid-cols-3">
            {ENGAGEMENTS.map((model, i) => (
              <GlyphPanel
                key={model.index}
                choreography={choreographyPool[CHOREO_OFFSETS.servicesEngagementModels + i]}
                color="black"
                className="flex h-full flex-col justify-between gap-12 bg-canvas p-8 transition-colors duration-600 ease-expo hover:bg-bone lg:p-12"
              >
                <div>
                  <h3 className="mt-8 text-title font-medium">{model.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{model.tagline}</p>
                </div>

                <div className="border-t border-hairline pt-5">
                  <p className="meta text-ink/35">Best for</p>
                  <p className="mt-2 text-sm text-ink/70">{model.fit}</p>
                </div>
              </GlyphPanel>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── 03.3 / Process ─────────────────────────────────────────── */}
      <RevealSection className="bg-canvas">
        <div className="shell py-section pt-[clamp(3.5rem,7.5vw,7.5rem)] pb-[clamp(3.5rem,5.5vw,5.5rem)]">
          <SectionHeader
            index="03"
            label="Process"
            wideSupport
            lines={["A clear path from the", "problem to the right", "working solution."]}
            description="Every engagement starts with understanding what needs to change, then moves through clear decisions, working previews and careful delivery. The exact process adapts to the scope, but the aim stays the same: build deliberately and keep the work visible throughout."
          />

          <div className="mt-20 border-t border-hairline">
            {process.map((step, i) => (
              <GlyphPanel
                key={step.index}
                choreography={choreographyPool[CHOREO_OFFSETS.servicesProcess + i]}
                color="black"
                glyphClassName="col-span-2 h-9 w-9 md:col-span-1"
                className="grid grid-cols-12 items-start gap-x-gutter gap-y-4 border-b border-hairline bg-canvas px-6 py-10 transition-colors duration-600 ease-expo hover:bg-bone"
              >
                <h3 className="col-span-10 text-title font-medium md:col-span-4">
                  {step.title}
                </h3>
                <p className="col-span-12 col-start-1 text-sm leading-relaxed text-ink/55 md:col-span-6 md:col-start-7">
                  {step.body}
                </p>
              </GlyphPanel>
            ))}
          </div>
        </div>
      </RevealSection>

      <CTABanner
        index="04"
        label="Contact"
        lines={["Not sure what you", "need yet? Start", "with the problem."]}
        note="You do not need to choose a service before speaking to us. Tell us what is not working, what needs to improve or what you want to build, and we’ll help define the right next step from there."
        cta="Start a conversation"
      />
    </>
  );
}
