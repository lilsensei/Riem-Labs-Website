import type { Metadata } from "next";
import LegalAccordion, { type LegalSection } from "@/components/LegalAccordion";
import JsonLd from "@/components/JsonLd";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/refund",
  title: "Refund Policy",
  description: `How deposits, staged payments, cancellations and refunds are handled across ${site.name} engagements.`,
});

const LAST_UPDATED = "September 2026";

const MailTo = () => (
  <a href={`mailto:${site.email}`} className="link-wipe text-ink">
    {site.email}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    index: "01",
    title: "Deposits",
    brief:
      "Any required deposit is credited toward the project and its refundability depends on whether work has started.",
    body: [
      "Before work begins, a deposit may be refundable subject to the signed engagement terms.",
      "Once work has started, the portion covering work already performed or committed costs may no longer be refundable.",
      "The specific proposal or agreement may define additional deposit terms.",
    ],
  },
  {
    index: "02",
    title: "Staged payments",
    brief:
      "Payments tied to completed stages are generally not refundable once that work has been delivered.",
    body: [
      "Where an engagement is divided into stages or milestones, payments may correspond to work completed during each stage.",
      "Once that work has been completed and delivered, the related payment generally covers services already performed.",
    ],
  },
  {
    index: "03",
    title: "Work not yet started",
    brief:
      "Amounts paid for clearly defined work that has not started may be refundable, subject to any committed third-party costs.",
    body: [
      "Where payment has been received for a clearly defined future stage that has not started, any refund will depend on the engagement terms, work already performed and costs already committed on the client’s behalf.",
    ],
  },
  {
    index: "04",
    title: "Cancelling an engagement",
    brief:
      "If an engagement ends early, the client pays for work completed and committed costs up to that point.",
    body: [
      "If an engagement is cancelled or terminated before completion, Riem Labs may calculate the value of work already completed together with third-party or other committed costs.",
      "Any genuinely unused balance should be handled according to the signed agreement and the work actually completed.",
    ],
  },
  {
    index: "05",
    title: "If delivered work does not match the agreed scope",
    brief:
      "If something we delivered materially differs from the agreed scope, we should first have the opportunity to correct it.",
    body: [
      "Where delivered work materially fails to match the agreed scope, the client should raise the issue within the relevant review period and allow Riem Labs a reasonable opportunity to investigate and correct it.",
      "Not every disagreement about preference, direction or later requirements automatically creates a refund entitlement.",
    ],
  },
  {
    index: "06",
    title: "Change of mind",
    brief:
      "A change of preference after approved work has been completed does not automatically make that work refundable.",
    body: [
      "If the client changes direction, preferences, strategy or requirements after approved work has been completed, additional work may require a revised scope or fee.",
      "Completed work is not automatically refundable merely because the preferred direction later changes.",
    ],
  },
  {
    index: "07",
    title: "Third-party costs",
    brief:
      "External costs already committed on the client’s behalf may not be refundable.",
    body: [
      "Domains, licences, stock assets, APIs, hosting, paid plugins, contractors or other external services may be subject to third-party refund terms.",
      "Riem Labs cannot guarantee refunds for costs already paid or committed to external providers.",
    ],
  },
  {
    index: "08",
    title: "Ongoing support and retainers",
    brief:
      "Ongoing-support fees cover reserved capacity or agreed services for a defined period.",
    body: [
      "The specific support or retainer agreement should define how capacity, cancellation, unused time and renewal are handled.",
      "This public policy does not impose a universal rollover or non-rollover rule across every ongoing engagement.",
    ],
  },
  {
    index: "09",
    title: "Refund method",
    brief:
      "Approved refunds are returned using a reasonable payment method, normally to the original payer where practical.",
    body: [
      "Where a refund is approved, Riem Labs will use a reasonable payment method and will normally return funds to the original payer where practical.",
      "Bank or payment-provider processing times may affect when returned funds become visible.",
    ],
  },
  {
    index: "10",
    title: "Refund requests",
    brief: `Refund or billing concerns should be sent to ${site.email} with the relevant project and invoice details.`,
    body: [
      "Riem Labs will review the request against the relevant proposal or agreement, payments received, work completed and costs already committed.",
    ],
  },
  {
    index: "11",
    title: "Legal rights",
    brief: "Nothing in this policy removes rights that cannot lawfully be excluded.",
    body: [
      "This policy should be read together with any rights and obligations that apply under applicable law.",
      "Where mandatory legal rights apply, they take precedence over inconsistent parts of this policy.",
    ],
  },
  {
    index: "12",
    title: "Contact",
    brief: `Questions about payments, cancellations or refunds can be sent to ${site.email}.`,
    body: ["Riem Labs", "Nairobi, Kenya", <MailTo key="email" />],
  },
];

export default function RefundPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema("Refund Policy", "/refund")} />

      <PageIntro
        index="08"
        label="Refunds"
        lines={["What happens", "to the money", "if plans change."]}
        lede="How deposits, staged payments, cancellations and refunds are handled across Riem Labs engagements. Any signed proposal, scope of work or agreement takes precedence where its terms differ from this policy."
        meta={[
          { label: "Last updated", value: LAST_UPDATED },
          { label: "Contact", value: <MailTo /> },
        ]}
      />

      <RevealSection className="bg-canvas">
        <div className="shell pb-section">
          <LegalAccordion sections={SECTIONS} />
        </div>
      </RevealSection>
    </>
  );
}
