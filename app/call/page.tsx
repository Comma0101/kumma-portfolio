import type { Metadata } from "next";
import CallPage from "@/components/CallPage";

export const metadata: Metadata = {
  title: "Voice agent demo",
  description:
    "Hear a voice AI agent take phone orders for Kumma Diner, a fictional demo restaurant with a real menu. Listen to recorded calls, or book a live demo. Every demo call is recorded and may be published.",
  alternates: { canonical: "https://kumma.me/call" },
  openGraph: {
    title: "Voice agent demo | Kumma",
    description:
      "A voice AI agent takes phone orders for Kumma Diner, a fictional demo restaurant with a real menu. Hear recorded calls, or book a live demo to try to break it.",
    url: "https://kumma.me/call",
    type: "website",
  },
};

export default function Page() {
  return <CallPage />;
}
