import type { Metadata } from "next";
import PerspectiveJourney from "@/components/personal/PerspectiveJourney";

const description =
  "Kumma Wu’s inquiry into consciousness, self-awareness, and how to live. A personal introduction through a spiral portrait and a passage from his writing.";

export const metadata: Metadata = {
  title: "A change of view",
  description,
  openGraph: {
    title: "A change of view | Kumma",
    description,
    url: "https://kumma.me/view/",
    type: "website",
    images: ["/og/portrait.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Comma_9fie",
    creator: "@Comma_9fie",
    title: "A change of view | Kumma",
    description,
    images: ["/og/portrait.png"],
  },
  robots: { index: false, follow: true },
};

export default function ViewPage() {
  return <PerspectiveJourney />;
}
