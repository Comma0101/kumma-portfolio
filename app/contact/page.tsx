import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import Paper from "@/components/personal/Paper";

export const metadata: Metadata = {
  title: "Write to me",
  description:
    "Write to Kumma Wu — about an idea, a build, a demo call, or a text worth reading slowly.",
  twitter: {
    card: "summary_large_image",
    site: "@Comma_9fie",
    title: "Write to me | Kumma",
    description: "Write to Kumma Wu — about an idea, a build, a demo call, or a text worth reading slowly.",
    images: ["/og/portrait.png"],
  },
  alternates: { canonical: "https://kumma.me/contact" },
};

export default function Page() {
  return (
    <Paper>
      <ContactPage />
    </Paper>
  );
}
