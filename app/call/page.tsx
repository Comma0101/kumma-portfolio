import type { Metadata } from "next";
import CallPage from "@/components/CallPage";
import Paper from "@/components/personal/Paper";

export const metadata: Metadata = {
  title: "Voice agent demo",
  description:
    "Hear a voice AI agent take phone orders for Kumma Diner, a fictional demo restaurant with a real menu. Read the menu it works from, or book a live demo. Every demo call is recorded and may be published.",
  twitter: {
    card: "summary_large_image",
    site: "@Comma_9fie",
    title: "Voice agent demo | Kumma",
    description: "A voice AI agent takes phone orders for Kumma Diner, a fictional demo restaurant with a real menu.",
    images: ["/og/portrait.png"],
  },
  alternates: { canonical: "https://kumma.me/call" },
  openGraph: {
    title: "Voice agent demo | Kumma",
    description:
      "A voice AI agent takes phone orders for Kumma Diner, a fictional demo restaurant with a real menu. Read its menu, or book a live demo to try to break it.",
    url: "https://kumma.me/call",
    type: "website",
  },
};

export default function Page() {
  return (
    <Paper>
      <CallPage />
    </Paper>
  );
}
