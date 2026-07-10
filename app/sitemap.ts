import type { MetadataRoute } from "next";
import { projects } from "@/data/projectData";
import { getAllPostIdsForAllLocales } from "@/lib/posts";

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
    "/call",
    "/benchmark",
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
    "/work/kota",
    "/work/archon",
    "/work/robinhood-dashboard",
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
  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
