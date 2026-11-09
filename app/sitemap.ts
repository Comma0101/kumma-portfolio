import type { MetadataRoute } from "next";
import { projects } from "@/data/projectData";
import { getAllPostIdsForAllLocales } from "@/lib/posts";
import { movedFrom } from "@/components/personal/routes";

const BASE = "https://kumma.me";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/agent",
    "/blog",
    "/gallery",
    "/stories",
    "/build",
    // Voice AI rebuild routes
    "/contact",
    "/about",
    "/latency",
    "/patterns",
    "/patterns/barge-in",
    "/patterns/endpointing",
    "/patterns/vad-tuning",
    "/patterns/streaming-stt",
    "/patterns/menu-grounding",
    "/patterns/clarify-before-commit",
    "/patterns/human-handoff",
    "/patterns/telephony-failure-modes",
    "/patterns/eval-harness",
    "/patterns/latency-budgets",
    "/work",
    "/work/map-art",
    "/work/kota",
    "/work/audiobook",
    "/work/archon",
    "/work/robinhood-dashboard",
    "/notes",
    "/notes/on-emotions",
    "/notes/on-emotions/zh",
    "/notes/same-light",
    "/notes/same-light/zh",
    "/notes/the-stranger",
    "/studies",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));
  const projectRoutes = projects.map((p) => ({
    url: `${BASE}/projects/${p.slug}`,
    lastModified: new Date(),
  }));
  const postRoutes = getAllPostIdsForAllLocales().map(({ params }) => ({
    url: `${BASE}/blog/${params.locale}/${params.slug}`,
    lastModified: new Date(),
  }));
  // A moved address is not a page of its own.
  return [...staticRoutes, ...projectRoutes, ...postRoutes].filter(
    ({ url }) => !movedFrom(url.slice(BASE.length)),
  );
}
