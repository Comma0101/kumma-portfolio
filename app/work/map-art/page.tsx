import type { Metadata } from "next";
import MapArt from "@/components/personal/MapArt";

const description = "Map Art by Kumma Wu. Two visual studies of belonging, bringing together street drawings of the places people have called home.";

export const metadata: Metadata = {
  title: "Map Art",
  description,
  alternates: { canonical: "https://kumma.me/work/map-art" },
  openGraph: {
    title: "Map Art | Kumma",
    description,
    url: "https://kumma.me/work/map-art",
    images: [{ url: "/art/map-art/share.png", width: 1200, height: 630, alt: "Map Art by Kumma Wu. Amsterdam and Los Angeles street drawings overlap in red and black ink." }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Comma_9fie",
    title: "Map Art | Kumma",
    description,
    images: ["/art/map-art/share.png"],
  },
};

export default function MapArtPage() {
  return <MapArt />;
}
