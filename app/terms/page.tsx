import type { Metadata } from "next";
import LegalAccordion, { type LegalSection } from "@/components/LegalAccordion";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `The commercial terms that apply to ${site.name} engagements.`,
};

const LAST_UPDATED = "September 2026";

const MailTo = () => (
  <a href={`mailto:${site.email}`} className="link-wipe text-ink">
    {site.email}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    index: "01",
    title: "Scope of work",
    brief:
      "Every engagement starts from an agreed written scope. Work outside that scope is agreed separately before it begins.",
    body: [
      "Riem Labs provides digital design, development, software, systems, automation, data and related technology services as described in the proposal, statement of work, quotation or other written agreement issued for a specific engagement.",
      "The agreed project documents define the scope, deliverables, responsibilities, fees and timeline for that engagement. Anything not expressly included is treated as outside scope unless agreed in writing.",
    ],
  },
  {
    index: "02",
    title: "Changes and additional work",
    brief:
      "If the requirements change, the scope, fee or timeline may need to change with them.",
    body: [
      "Projects can change as requirements become clearer. If the client requests work outside the agreed scope, Riem Labs may provide a revised estimate, additional fee, updated timeline or separate scope of work before proceeding.",
      "Materially new requirements are not automatically included within an existing project fee.",
    ],
  },
  {
    index: "03",
    title: "Fees and payment",
    brief:
      "Fees and payment schedules are agreed before work begins. Overdue payments may pause the engagement.",
    body: [
      "Fees, payment schedules and any required initial payment are stated in the relevant proposal, quotation or agreement.",
      "Work may begin only after any required initial payment has been received. Invoices must be paid within the period stated on the invoice or engagement document.",
      "Riem Labs may pause work where an invoice becomes overdue and may adjust timelines where the delay affects delivery.",
      "Third-party costs such as hosting, domains, licences, paid software, APIs, stock assets or external services are separate unless expressly included.",
    ],
  },
  {
    index: "04",
    title: "Client responsibilities",
    brief:
      "Good work depends on timely information, access, approvals and feedback from both sides.",
    body: [
      "The client is responsible for providing the information, content, access, approvals and feedback reasonably required to complete the work.",
      "The client must ensure that materials they provide may legally be used for the project.",
      "Where client delays, missing information or late approvals affect progress, delivery dates may move accordingly.",
    ],
  },
  {
    index: "05",
    title: "Timelines and delays",
    brief:
      "Timelines depend on the agreed scope and reasonable cooperation throughout the project.",
    body: [
      "Project timelines are based on the agreed scope and reasonable cooperation from both parties.",
      "Target dates may change where scope changes, required information or approvals are delayed, third-party services cause delays, unforeseen technical issues arise, or circumstances outside Riem Labs’ reasonable control affect delivery.",
      "Material timing changes should be communicated as early as reasonably possible.",
    ],
  },
  {
    index: "06",
    title: "Ownership",
    brief:
      "Final custom deliverables transfer after full payment. Riem retains its reusable tools, methods and underlying know-how.",
    body: [
      "Unless otherwise agreed, ownership of final custom deliverables created specifically for the client transfers after all amounts due for the engagement have been paid in full.",
      "Riem Labs retains ownership of pre-existing tools, internal methods, reusable components, frameworks, libraries, development utilities, general know-how and material created independently of the engagement.",
      "Where reusable Riem material forms part of a deliverable, the client receives the rights reasonably necessary to use the completed work.",
      "Third-party intellectual property remains subject to its own licence terms.",
    ],
  },
  {
    index: "07",
    title: "Third-party services",
    brief:
      "External platforms, licences and services remain subject to their own terms, pricing and availability.",
    body: [
      "Projects may rely on third-party services including hosting platforms, domains, payment providers, APIs, software, fonts, plugins, analytics tools or other external technology.",
      "Those services remain subject to their own terms, pricing, availability and policies.",
      "Riem Labs is not responsible for changes, outages or restrictions imposed by a third-party provider, although reasonable troubleshooting or migration assistance may be provided where agreed.",
    ],
  },
  {
    index: "08",
    title: "Confidentiality",
    brief:
      "Confidential business and technical information is treated as private and used only for the engagement.",
    body: [
      "Each party should treat confidential business, technical and commercial information received from the other as confidential and use it only for the purposes of the engagement.",
      "Confidentiality obligations do not apply to information that is already public, was lawfully known before disclosure, is independently developed, is received lawfully from another source, or must be disclosed by law.",
      "Where a separate NDA exists, that agreement takes precedence on confidentiality matters.",
    ],
  },
  {
    index: "09",
    title: "Portfolio and publicity",
    brief:
      "Unless agreed otherwise, Riem may show completed public-facing work as part of its portfolio.",
    body: [
      "Unless confidentiality obligations or a written agreement say otherwise, Riem Labs may identify the client and display completed public-facing work in its portfolio, website, presentations and reasonable promotional materials.",
      "Riem Labs will not publish confidential systems, internal information, private metrics or restricted material simply because portfolio rights apply.",
      "A client may request publication restrictions before release, and any agreed NDA takes precedence.",
    ],
  },
  {
    index: "10",
    title: "Testing and acceptance",
    brief:
      "Work is reviewed and tested before launch, with material issues raised during the agreed review period.",
    body: [
      "Riem Labs performs reasonable testing appropriate to the agreed scope before launch or handover.",
      "The client should review deliverables and raise material issues within the review period stated in the project documents.",
      "Minor differences that do not materially affect agreed functionality should not prevent reasonable acceptance.",
      "Changes requested after acceptance or launch may be treated as new work unless they correct something Riem Labs was already obligated to deliver.",
    ],
  },
  {
    index: "11",
    title: "Support and maintenance",
    brief: "Support after launch is included only where the engagement says it is.",
    body: [
      "Post-launch support is included only where stated in the relevant engagement documents.",
      "Ongoing maintenance, content updates, technical support, monitoring, new features, third-party changes or improvements may require a separate support arrangement or additional fee.",
    ],
  },
  {
    index: "12",
    title: "Suspension and termination",
    brief:
      "An engagement may be paused or ended where agreed obligations are not being met.",
    body: [
      "Either party may end an engagement in accordance with the terms agreed for that project.",
      "Riem Labs may suspend or terminate work where invoices remain unpaid, the client materially breaches the agreement, required cooperation is repeatedly withheld, or the requested work becomes unlawful or materially changes beyond the agreed engagement.",
      "If an engagement ends early, the client remains responsible for work completed and costs already committed up to the termination date.",
      "Transfer of incomplete work may depend on payment of amounts properly due.",
    ],
  },
  {
    index: "13",
    title: "Professional standard",
    brief: "Riem provides its services with reasonable professional care and skill.",
    body: [
      "Riem Labs provides its services with reasonable professional care and skill.",
      "Unless specifically agreed in writing, Riem Labs does not guarantee uninterrupted operation, zero defects, search rankings, revenue, conversion improvements, permanent compatibility with third-party services or specific commercial outcomes.",
    ],
  },
  {
    index: "14",
    title: "Liability",
    brief: "Liability is limited to a reasonable extent permitted by applicable law.",
    body: [
      "To the maximum extent permitted by applicable law, Riem Labs is not responsible for indirect, incidental or consequential losses arising from an engagement, including lost profits, lost opportunities, loss of goodwill or business interruption.",
      "Where legally permitted, Riem Labs’ aggregate liability relating to a particular engagement is intended to be limited to the fees paid to Riem Labs for that engagement.",
      "Nothing in these terms excludes liability that cannot lawfully be excluded or limited.",
    ],
  },
  {
    index: "15",
    title: "Data and personal information",
    brief:
      "Personal information used during an engagement must be handled in line with applicable data-protection obligations.",
    body: [
      "Where Riem Labs processes personal information in connection with an engagement, both parties are expected to comply with applicable data-protection obligations.",
      "Some engagements may require more specific data-processing arrangements depending on the nature of the information, systems and services involved.",
    ],
  },
  {
    index: "16",
    title: "Governing law and disputes",
    brief:
      "Riem engagements are governed by Kenyan law unless the parties agree otherwise in writing.",
    body: [
      "These terms and Riem Labs engagements are governed by the laws of Kenya unless the parties agree otherwise in writing.",
      "Before formal proceedings, the parties should first attempt in good faith to resolve a dispute through direct discussion.",
      "Any further dispute process will follow the relevant engagement agreement or applicable law.",
    ],
  },
  {
    index: "17",
    title: "Independent relationship",
    brief:
      "Riem works as an independent service provider unless another relationship is expressly agreed.",
    body: [
      "Nothing in an engagement creates an employment relationship, partnership, joint venture or agency relationship unless expressly agreed in writing.",
    ],
  },
  {
    index: "18",
    title: "Changes to these terms",
    brief:
      "These general terms may change over time, but existing signed agreements are not silently rewritten.",
    body: [
      "Riem Labs may update these general terms from time to time.",
      "For an existing engagement, material commercial changes do not retroactively override an already signed proposal, scope of work or agreement unless both parties agree.",
      "The version applicable to a specific engagement is the version in effect when the engagement is agreed, unless otherwise stated.",
    ],
  },
  {
    index: "19",
    title: "Contact",
    brief: `Questions about these terms can be sent to ${site.email}.`,
    body: ["Riem Labs", "Nairobi, Kenya", <MailTo key="email" />],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageIntro
        index="07"
        label="Terms"
        lines={["How we", "work, in", "writing."]}
        lede="The commercial terms that apply to Riem Labs engagements. Any signed proposal, scope of work or agreement takes precedence where its terms differ from this page."
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
