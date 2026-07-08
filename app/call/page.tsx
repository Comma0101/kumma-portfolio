import type { Metadata } from "next";
import CallPage from "@/components/CallPage";

export const metadata: Metadata = {
  title: "Call the agent",
  description:
    "Call the live voice AI agent taking phone orders for Kumma Diner, a fictional demo restaurant with a real menu. Try to break it. Every call is recorded and may be published.",
  alternates: { canonical: "https://kumma.me/call" },
  openGraph: {
    title: "Call the agent | Kumma",
    description:
      "A live voice AI agent takes phone orders for Kumma Diner, a fictional demo restaurant with a real menu. Order five items, switch to Mandarin, try to break it.",
    url: "https://kumma.me/call",
    type: "website",
  },
};

export default function Page() {
  return <CallPage />;
}
