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
    "/work/kota",
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
