import type { Metadata } from "next";
import BenchmarkPage from "@/components/BenchmarkPage";
import Paper from "@/components/personal/Paper";

const description =
  "An unreleased draft of a stress suite for real-time voice agents, outlining 50 proposed scenarios and a scoring rubric. Audio and a scoring repository are planned.";

export const metadata: Metadata = {
  title: "Voice Agent Stress Suite — draft",
  description,
  robots: { index: false },
  openGraph: {
    title: "Voice Agent Stress Suite — draft | Kumma",
    description,
    url: "https://kumma.me/benchmark",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Comma_9fie",
    title: "Voice Agent Stress Suite — draft | Kumma",
    description,
    images: ["/og/portrait.png"],
  },
  alternates: { canonical: "https://kumma.me/benchmark" },
};

export default function BenchmarkRoute() {
  return (
    <Paper>
      <BenchmarkPage />
    </Paper>
  );
}
