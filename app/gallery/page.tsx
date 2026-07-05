import type { Metadata } from "next";
import GalleryLandingClient from "./GalleryLandingClient";

const description =
  "Interface studies for atmosphere, pacing, and system legibility.";

export const metadata: Metadata = {
  title: "Visual Systems",
  description,
  openGraph: {
    title: "Visual Systems | Kumma",
    description,
    url: "/gallery",
    siteName: "Kumma",
    type: "website",
    images: ["/og/home.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Systems | Kumma",
    description,
    images: ["/og/home.png"],
  },
};

export default function GalleryLanding() {
  return <GalleryLandingClient />;
}
