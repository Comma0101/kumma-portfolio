import type { Metadata } from "next";
import StaticAliasRedirect from "@/components/work/StaticAliasRedirect";
import {
  legacyWorkSlugs,
  resolveLegacyWorkHref,
} from "@/data/workRoutes";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return legacyWorkSlugs.map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const href = resolveLegacyWorkHref(slug);

  if (!href) {
    notFound();
  }

  return {
    title: "Project page moved",
    alternates: { canonical: `https://kumma.me${href}` },
    robots: { index: false, follow: true },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const href = resolveLegacyWorkHref(slug);

  if (!href) {
    notFound();
  }

  // GitHub Pages serves exported HTML aliases; a host-level 301/308 requires a hosting/CDN migration.
  return (
    <StaticAliasRedirect
      href={href}
      destinationLabel="the canonical work page"
    />
  );
}
