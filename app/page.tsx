import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";
import BracketLink from "@/components/BracketLink";
import CTABanner from "@/components/CTABanner";
import HeroSpotlight from "@/components/HeroSpotlight";
import JsonLd from "@/components/JsonLd";
import LogoMarquee from "@/components/LogoMarquee";
import ProjectCard from "@/components/ProjectCard";
import SectionWipe from "@/components/SectionWipe";
import ServiceCard from "@/components/ServiceCard";
import ApproachStrip from "@/components/ApproachStrip";
import RevealSection from "@/components/RevealSection";
import SectionHeader from "@/components/SectionHeader";
import { Fade } from "@/components/RevealText";
import { CHOREO_OFFSETS, choreographyPool } from "@/lib/glyphChoreographies";
import { featuredProjects } from "@/lib/projects";
import { organizationSchema, webSiteSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/services";

/**
 * The homepage title names the studio itself, so it opts out of the layout's
 * `%s — Riem Labs` template rather than ending up saying it twice.
 */
export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Riem Labs — Websites, Digital Products & Business Systems",
  description:
    "Riem Labs is a Nairobi-based digital practice designing and building websites, digital products and business systems around real operational needs.",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      {/* The studio and the site as entities, declared once, here — this is
          the page both @ids are named after and the page every other page's
          breadcrumb points back to. */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />

      {/* ── Hero: dual-layer cursor spotlight ──────────────────────── */}
      <HeroSpotlight />

      {/* ── 01 / About Us — wipes in from the reveal band ──────────── */}
      <SectionWipe
        id="about"
        className="bg-canvas"
        reveal={<AboutSection variant="reveal" />}
        trail={<AboutSection variant="trail" />}
      >
        <AboutSection />
      </SectionWipe>

      {/* ── Approach strip ─────────────────────────────────────────── */}
      <ApproachStrip />

      {/* ── 03 / Work ──────────────────────────────────────────────── */}
      <RevealSection id="work" className="bg-bone">
        <div className="shell py-section">
          <SectionHeader
            index="03"
            label="Work"
            wideSupport
            lines={["Selected work, shaped around", "real business needs."]}
            description="A selection of websites, digital products and systems that show how Riem approaches different business problems, from customer-facing experiences to the workflows behind them."
          />

          <div className="mt-20 border-t border-hairline">
            {featuredProjects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                layout="row"
                choreography={choreographyPool[CHOREO_OFFSETS.homeWork + i]}
              />
            ))}
          </div>

          <Fade className="mt-14 flex justify-end">
            <BracketLink href="/work" variant="boxed">
              View all work
            </BracketLink>
          </Fade>
        </div>
      </RevealSection>

      {/* ── Tech stack ─────────────────────────────────────────────── */}
      <LogoMarquee />

      {/* ── 04 / Services ──────────────────────────────────────────── */}
      <RevealSection id="services" className="bg-bone">
        {/* Tightened bottom only, matching the seam already approved on
            About’s Process → Contact and Work’s Engagement → Contact: a
            standard section running straight into the black CTA. All three
            measured 158px here before this. The Work → stack strip seam
            above is left alone — content into content across a background
            change, the same category as About’s Story → Principles. */}
        <div className="shell py-section pb-[clamp(3.5rem,5.5vw,5.5rem)]">
          <SectionHeader
            index="04"
            label="Services"
            wideSupport
            lines={["The right system for the", "problem in front of you."]}
            description="From focused websites and digital products to internal systems, automation, analytics and intelligent workflows, we build around what the business actually needs and keep the solution as simple as the problem allows."
          />

          <div className="mt-20 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {services.map((service, i) => (
              <Fade key={service.index}>
                <ServiceCard service={service} choreography={choreographyPool[CHOREO_OFFSETS.homeServices + i]} />
              </Fade>
            ))}
          </div>

          <Fade className="mt-14 flex justify-end">
            <BracketLink href="/services" variant="boxed">
              Explore all services
            </BracketLink>
          </Fade>
        </div>
      </RevealSection>

      {/* ── 05 / Contact ───────────────────────────────────────────── */}
      <CTABanner
        id="contact"
        lines={["Start with the problem.", "We’ll work out", "what it needs."]}
        note="Whether you have a clear brief or an early idea, tell us what the business needs to solve. We’ll help define the right next step and keep the process straightforward from the start."
        cta="Start a conversation"
      />
    </>
  );
}
