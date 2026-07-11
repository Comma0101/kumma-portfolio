import {
  legacyWorkSlugs,
  resolveLegacyWorkHref,
} from "@/data/workRoutes";
import { notFound, permanentRedirect } from "next/navigation";

export function generateStaticParams() {
  return legacyWorkSlugs.map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const href = resolveLegacyWorkHref(slug);

  if (!href) {
    notFound();
  }

  permanentRedirect(href);
}
