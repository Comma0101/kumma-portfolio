import type { Metadata } from "next";
import StaticAliasRedirect from "@/components/work/StaticAliasRedirect";

export const metadata: Metadata = {
  title: "Work index moved",
  alternates: { canonical: "https://kumma.me/work" },
  robots: { index: false, follow: true },
};

export default function ProjectsPage() {
  return (
    <StaticAliasRedirect href="/work" destinationLabel="the work index" />
  );
}
