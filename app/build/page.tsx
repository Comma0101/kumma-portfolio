import type { Metadata } from "next";
import BuildLanding from "@/components/build/BuildLanding";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/components/build/buildContent";

export const metadata: Metadata = {
  title: "Custom AI agents for your business",
  description:
    "I design and build custom AI agents for small businesses: phone agents, booking, support, and follow-up. Built and run for you. Book a free consult.",
  openGraph: {
    title: "Custom AI agents for your business | Kumma",
    description:
      "Stop missing calls, bookings, and leads. I build and run a custom AI agent for your business. Book a free consult.",
    url: "https://kumma.me/build",
    type: "website",
  },
  alternates: { canonical: "https://kumma.me/build" },
};

// Commercial-intent structured data: helps this page surface for
// "custom AI agent / AI receptionist" queries and in AI answer engines.
const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom AI agent development for small businesses",
  serviceType: "AI agent development",
  description:
    "Design, build, and operation of custom AI agents for small businesses: AI phone agents, booking and scheduling, customer support, and lead follow-up. Built and run for you.",
  url: "https://kumma.me/build",
  areaServed: "US",
  provider: {
    "@type": "Person",
    name: "Kumma",
    alternateName: "Yang Wu",
    url: "https://kumma.me",
  },
  offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function BuildPage() {
  return (
    <>
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <BuildLanding />
    </>
  );
}
