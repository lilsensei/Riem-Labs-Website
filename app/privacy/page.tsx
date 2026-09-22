import type { Metadata } from "next";
import LegalAccordion, { type LegalSection } from "@/components/LegalAccordion";
import JsonLd from "@/components/JsonLd";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: `What ${site.name} collects, why it is used, and the choices available to you.`,
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
    title: "What we collect",
    brief:
      "We collect only the information you choose to provide and basic technical information needed to operate the site.",
    body: [
      "This may include information submitted through contact forms or direct communication, such as your name, email address, company or project information, enquiry details and other information you choose to provide.",
      "Basic technical information may also be generated during normal website operation where necessary for security, reliability or delivery.",
    ],
  },
  {
    index: "02",
    title: "How we collect it",
    brief:
      "Information may come through forms, direct communication or normal website operation.",
    body: [
      "Information may be provided directly through the website, email, telephone, WhatsApp or other communication channels used to contact Riem Labs.",
      "Some technical information may also be generated automatically by the technologies needed to operate and secure the website.",
    ],
  },
  {
    index: "03",
    title: "Why we use it",
    brief:
      "We use personal information to respond to enquiries, deliver agreed work and operate Riem Labs.",
    body: [
      "Information may be used to respond to enquiries, prepare proposals, communicate during an engagement, deliver agreed services, maintain business records, improve internal operations, protect the website and comply with applicable obligations.",
    ],
  },
  {
    index: "04",
    title: "Contact form information",
    brief:
      "Enquiry details are used only to understand and respond to the request you submit.",
    body: [
      "Information submitted through the contact form is intended to help Riem Labs understand the enquiry and respond appropriately.",
      "This website is currently a front-end interface and the contact form is not yet connected to a system that delivers or stores submissions. Until that connection is in place, details entered into the form are not transmitted to Riem Labs, recorded in a database or passed to any other service. If you need to reach us in the meantime, please use the email address or phone number on the Contact page.",
    ],
  },
  {
    index: "05",
    title: "Cookies and analytics",
    brief:
      "Any analytics or cookies used on the site should be limited to what is necessary or deliberately enabled.",
    body: [
      "This website does not currently run optional analytics, advertising or tracking technologies, and it does not set cookies for those purposes.",
      "Essential browser or hosting technologies may operate where required to deliver the website securely and reliably. If optional analytics are introduced later, this page will be updated to describe them.",
    ],
  },
  {
    index: "06",
    title: "Third-party services",
    brief:
      "Some site or project functions may rely on external providers that process information under their own terms.",
    body: [
      "Riem Labs may use external technology providers for website hosting, communications, project delivery or other business functions.",
      "Those providers operate under their own privacy and security terms.",
    ],
  },
  {
    index: "07",
    title: "How long we keep information",
    brief:
      "Information is retained only for as long as reasonably necessary for the purpose it was collected or where records must be kept.",
    body: [
      "Retention depends on the purpose for which information was collected, the nature of any engagement and applicable business or legal requirements.",
    ],
  },
  {
    index: "08",
    title: "How we protect information",
    brief:
      "We use reasonable technical and organisational measures to protect information under our control.",
    body: [
      "No system can guarantee absolute security. Riem Labs aims to use reasonable safeguards appropriate to the nature of the information and the systems involved.",
    ],
  },
  {
    index: "09",
    title: "Sharing information",
    brief:
      "We do not sell personal information. Information is shared only where necessary for service delivery, legal obligations or approved providers.",
    body: [
      "Personal information is not sold.",
      "Information may be shared with service providers, professional advisers, contractors or authorities where reasonably necessary to deliver services, operate the business, protect legitimate interests or comply with applicable obligations.",
    ],
  },
  {
    index: "10",
    title: "Your rights",
    brief:
      "You may ask about personal information we hold and request correction, deletion or other action where applicable.",
    body: [
      "Depending on the circumstances and applicable law, you may have rights relating to access, correction, deletion, objection, restriction or other treatment of personal information.",
      <span key="requests">
        Requests can be sent to <MailTo />.
      </span>,
    ],
  },
  {
    index: "11",
    title: "International services",
    brief:
      "Some technology providers may process information outside Kenya, subject to the protections applicable to those services.",
    body: [
      "Some third-party technology providers may operate infrastructure or process information in other countries.",
      "Where this occurs, the relevant provider and applicable safeguards govern that processing.",
    ],
  },
  {
    index: "12",
    title: "Children’s privacy",
    brief:
      "Riem Labs services and this website are not intended to collect personal information from children.",
    body: [
      "Riem Labs does not intentionally design its website or business services for children or knowingly seek personal information from children through the site.",
    ],
  },
  {
    index: "13",
    title: "Changes to this policy",
    brief:
      "We may update this policy as the website, services or legal requirements change.",
    body: [
      "When material changes are made, the updated version and review date should be published on this page.",
    ],
  },
  {
    index: "14",
    title: "Contact",
    brief: `Privacy questions can be sent to ${site.email}.`,
    body: ["Riem Labs", "Nairobi, Kenya", <MailTo key="email" />],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema("Privacy Policy", "/privacy")} />

      <PageIntro
        index="06"
        label="Privacy"
        lines={["What we do", "with your", "information."]}
        lede="We collect only the information needed to respond to enquiries, deliver our services and operate the site responsibly. This policy explains what we collect, why we use it and the choices available to you."
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
