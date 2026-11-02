import type { Metadata } from "next";
import Moved from "@/components/personal/Moved";
import { moved } from "@/components/personal/routes";
import { menuItems } from "@/components/menuItems";

export async function generateStaticParams() {
  return menuItems.map((_, index) => ({ collectionId: index.toString() }));
}

export const metadata: Metadata = {
  title: "Moved",
  robots: { index: false },
  alternates: { canonical: "https://kumma.me/studies/" },
};

export default function GalleryCollectionPage() {
  return <Moved {...moved["/gallery"]} />;
}
