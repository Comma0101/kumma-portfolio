import type { Metadata } from "next";
import BuildLanding from "@/components/build/BuildLanding";

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

export default function BuildPage() {
  return <BuildLanding />;
}
