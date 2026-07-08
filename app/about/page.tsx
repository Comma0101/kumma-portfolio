import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Wu is an independent builder of real-time voice AI systems in Los Angeles. Working principles and personal work.",
  openGraph: {
    title: "About | Kumma",
    description:
      "Wu is an independent builder of real-time voice AI systems in Los Angeles. Working principles and personal work.",
    url: "https://kumma.me/about",
    type: "website",
  },
  alternates: { canonical: "https://kumma.me/about" },
};

export default function Page() {
  return <AboutPage />;
}
