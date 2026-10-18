import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import Paper from "@/components/personal/Paper";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a real-time voice AI engagement: a voice agent audit, a scoped build to production, or ongoing advisory. Tell me the problem and the constraint.",
  alternates: { canonical: "https://kumma.me/contact" },
};

export default function Page() {
  return (
    <Paper>
      <ContactPage />
    </Paper>
  );
}
